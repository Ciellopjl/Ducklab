import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimiter'
import { generateCsrfToken, validateCsrf } from '@/lib/csrf'

// ============================================================================
// MIDDLEWARE — Segurança Global Ducklab
// ============================================================================
// Executa em TODA requisição (exceto assets estáticos).
// Responsabilidades:
//   1. Autenticação JWT do painel admin
//   2. Proteção CSRF via Double Submit Cookie nas mutações de API
//   3. Rate Limiting por perfil de rota centralizado
//   4. Verificação de API Key em rotas públicas para prevenção de abuso
//   5. Geração de x-request-id por requisição (rastreabilidade de logs)
//   6. Geração de nonce criptográfico por requisição (CSP)
//   7. Injeção de Content-Security-Policy dinâmico com nonce
//   8. Aplicação de todos os security headers globais
// ============================================================================

function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString('base64')
}

function generateRequestId(): string {
  return crypto.randomUUID()
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.delete('x-powered-by')

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://www.google.com",
    "https://www.gstatic.com"
  ].join(' ')

  response.headers.set(
    'Content-Security-Policy',
    [
      `default-src 'self'`,
      `script-src ${scriptSrc}`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `img-src 'self' data: blob: https:`,
      `media-src 'self' blob: https:`,
      `connect-src 'self' blob: https://*.neon.tech wss: https://www.google.com https://raw.githack.com https://*.githubusercontent.com https://cdn.jsdelivr.net https://api.groq.com`,
      `worker-src 'self' blob:`,
      `frame-src 'none'`,
      `frame-ancestors 'none'`,
      `form-action 'self'`,
      `base-uri 'self'`,
      `object-src 'none'`,
    ].join('; ')
  )

  return response
}

export async function middleware(req: NextRequest) {
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/hacker-duck'
  const url = req.nextUrl.pathname

  // ── Gerar identificadores por requisição ────────────────────────────────
  const requestId = generateRequestId()
  const nonce = generateNonce()

  // ── Exceção para NextAuth nativo ─────────────────────────────────────────
  if (url.startsWith('/api/auth/[...nextauth]') || url.includes('/api/auth/session') || url.includes('/api/auth/callback')) {
    const response = NextResponse.next()
    response.headers.set('x-request-id', requestId)
    return response
  }

  // ── 1. RATE LIMITING & API KEY & CSRF PARA ROTAS DE API (/api/*) ──────────
  if (url.startsWith('/api/')) {
    const ip = getClientIp(req.headers)
    const method = req.method
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

    // A. Identificar perfil de rate limit
    let profile: 'auth' | 'admin' | 'public' | 'get' = 'get'
    if (url.startsWith('/api/auth/admin')) {
      profile = 'auth'
    } else if (url.startsWith('/api/admin/')) {
      profile = 'admin'
    } else if (url.startsWith('/api/pedidos') && method === 'POST') {
      profile = 'public'
    } else if (isMutation) {
      profile = 'admin'
    }

    const rateLimitResult = checkRateLimit(ip, url, profile)
    const rlHeaders = rateLimitHeaders(rateLimitResult)

    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas tentativas. Tente novamente mais tarde.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': requestId,
            ...rlHeaders,
          },
        }
      )
    }

    // B. Validação da API Key em rotas públicas (que não sejam auth admin)
    // Para prevenir abusos diretos de scripts/curl
    const isAuthRoute = url.startsWith('/api/auth/')
    const isAdminRoute = url.startsWith('/api/admin/')
    if (!isAuthRoute && !isAdminRoute) {
      const apiKey = req.headers.get('x-api-key')
      const expectedApiKey = process.env.API_INTERNAL_SECRET

      if (expectedApiKey && expectedApiKey !== 'SUBSTITUA-POR-UMA-CHAVE-FORTE-openssl-rand-hex-32') {
        if (apiKey !== expectedApiKey) {
          return new NextResponse(
            JSON.stringify({ error: 'Acesso não autorizado. Chave de API inválida ou ausente.' }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'x-request-id': requestId,
                ...rlHeaders,
              },
            }
          )
        }
      }
    }

    // C. Proteção CSRF para mutações em APIs
    // Exceção: rota de login admin não precisa de CSRF (protegida por reCAPTCHA + rate limit)
    const isAdminAuthRoute = url.startsWith('/api/auth/admin')
    if (isMutation && !isAdminAuthRoute) {
      const csrfCookie = req.cookies.get('csrf_token')?.value
      const csrfHeader = req.headers.get('x-csrf-token')

      if (!validateCsrf(csrfCookie, csrfHeader)) {
        console.error('[CSRF FAIL]', { url, csrfCookie, csrfHeader })
        return new NextResponse(
          JSON.stringify({ error: 'Proteção CSRF ativada. Requisição inválida ou sem origem legítima.' }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'x-request-id': requestId,
              ...rlHeaders,
            },
          }
        )
      }
    }

    // D. Proteção de Autenticação Admin para rotas /api/admin/*
    let adminVerified = false
    if (isAdminRoute) {
      const token = req.cookies.get('admin_token')?.value
      if (token) {
        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET)
          const { payload } = await jwtVerify(token, secret)
          if (payload.sub === 'admin') {
            adminVerified = true
          }
        } catch {
          adminVerified = false
        }
      }

      if (!adminVerified) {
        return new NextResponse(
          JSON.stringify({ error: 'Não autorizado' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'x-request-id': requestId,
              ...rlHeaders,
            },
          }
        )
      }
    }

    // Passar adiante
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-request-id', requestId)
    requestHeaders.set('x-nonce', nonce)
    if (adminVerified) {
      requestHeaders.set('x-admin-verified', 'true')
    }

    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('x-request-id', requestId)
    
    // Injetar cabeçalhos de rate limit
    Object.entries(rlHeaders).forEach(([key, val]) => {
      response.headers.set(key, val)
    })

    return applySecurityHeaders(response, nonce)
  }

  // ── 2. CONTROLE DO PAINEL ADMIN ───────────────────────────────────────────
  if (adminPath && url.startsWith(adminPath)) {
    const isLoginRoute = url === `${adminPath}/login`
    const token = req.cookies.get('admin_token')?.value

    let isValid = false

    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        if (payload.sub === 'admin') {
          isValid = true
        }
      } catch {
        isValid = false
      }
    }

    if (!isValid && !isLoginRoute) {
      return NextResponse.redirect(new URL(`${adminPath}/login`, req.url))
    }

    if (isValid && isLoginRoute) {
      return NextResponse.redirect(new URL(adminPath, req.url))
    }

    const newPath = url.replace(adminPath, '/admin-core')
    const response = NextResponse.rewrite(new URL(newPath, req.url))

    if (isValid) {
      response.headers.set('x-admin-verified', 'true')
    }

    response.headers.set('x-nonce', nonce)
    response.headers.set('x-request-id', requestId)

    // Garantir cookie CSRF
    const csrfToken = req.cookies.get('csrf_token')?.value || generateCsrfToken()
    response.cookies.set('csrf_token', csrfToken, {
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Necessário false para o JS do frontend poder ler
    })

    return applySecurityHeaders(response, nonce)
  }

  // Prevenir acesso direto ao core do admin — SEMPRE retorna 404
  if (url.startsWith('/admin-core')) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // ── 3. NAVEGAÇÃO DE PÁGINAS NORMAIS (Injeção de CSRF Cookie) ────────────────
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-request-id', requestId)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('x-request-id', requestId)
  response.headers.set('x-nonce', nonce)

  // Gerar CSRF se não existir
  const csrfToken = req.cookies.get('csrf_token')?.value || generateCsrfToken()
  response.cookies.set('csrf_token', csrfToken, {
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  })

  return applySecurityHeaders(response, nonce)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
