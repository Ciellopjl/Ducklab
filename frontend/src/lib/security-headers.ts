import { NextResponse } from 'next/server'

/**
 * Aplica todos os security headers em uma resposta.
 * Mantido separado do middleware para ser testável de forma isolada.
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Força HTTPS por 1 ano + preload — previne downgrade attacks
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // Previne clickjacking via iframe embedding
  response.headers.set('X-Frame-Options', 'DENY')

  // Previne MIME-type sniffing que pode executar scripts disfarçados
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Não envia o referrer fora da origem — protege URLs internas do admin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Bloqueia APIs de hardware que não são necessárias no admin
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')

  // XSS Protection legado (ainda importante para IE/Edge antigos)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // CSP restritivo para Next.js 14:
  // - default-src 'self': apenas recursos da mesma origem
  // - script-src: 'unsafe-inline' necessário para Next.js _next/static chunks
  // - img-src data: necessário para imagens Base64 salvas no DB
  // - connect-src: libera chamadas para o próprio servidor e Neon
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval necessário para Next.js HMR em dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.neon.tech wss:",
      "frame-ancestors 'none'", // redundante com X-Frame-Options, mas Defense-in-Depth
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; ')
  )

  return response
}
