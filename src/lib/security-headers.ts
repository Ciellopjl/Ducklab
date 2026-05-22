import { NextResponse } from 'next/server'

// ============================================================================
// SECURITY HEADERS — Helper para uso em Server Components e API Routes
// ============================================================================
// O middleware já aplica os headers globalmente em toda resposta.
// Este módulo existe para:
//   1. Reforçar headers em respostas de API criadas diretamente (new NextResponse)
//   2. Ser importado em testes unitários de forma isolada
//   3. Centralizar a CSP base usada como fallback quando o nonce não está disponível
// ============================================================================

/**
 * Aplica todos os security headers obrigatórios em uma NextResponse.
 * Aceita opcionalmente um nonce para injeção na CSP.
 *
 * Nota: O middleware já aplica esses headers globalmente.
 * Use esta função apenas em respostas criadas manualmente em API routes
 * (ex: new NextResponse(...)) onde o middleware não intercepta a resposta.
 */
export function applySecurityHeaders(response: NextResponse, nonce?: string): NextResponse {
  // Força HTTPS por 2 anos + preload — previne downgrade attacks
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  // Previne clickjacking via iframe embedding
  response.headers.set('X-Frame-Options', 'DENY')

  // Previne MIME-type sniffing que pode executar scripts disfarçados
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Não envia o referrer fora da origem — protege URLs internas do admin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Bloqueia APIs de hardware que não são necessárias
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')

  // XSS Protection legado (ainda relevante para browsers antigos)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // ── CSP ────────────────────────────────────────────────────────────────────
  // Se nonce disponível, usa 'nonce-{nonce}' para script-src
  // Se não, usa policy mais restritiva sem unsafe-inline
  const isDev = process.env.NODE_ENV !== 'production'
  const scriptSrc = nonce
    ? (isDev
        ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://www.google.com https://www.gstatic.com`
        : `'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com https://www.gstatic.com`)
    : (isDev
        ? `'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com`
        : `'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com`)

  response.headers.set(
    'Content-Security-Policy',
    [
      `default-src 'self'`,
      `script-src ${scriptSrc}`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `img-src 'self' data: blob: https:`,
      `connect-src 'self' blob: https://*.neon.tech wss: https://www.google.com https://raw.githack.com https://*.githubusercontent.com https://cdn.jsdelivr.net`,
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
