// ============================================================================
// CSRF PROTECTION — Ducklab Security
// ============================================================================
// Implementação do padrão Double Submit Cookie para proteção CSRF.
//
// Funcionamento:
//   1. O middleware define um cookie 'csrf_token' nas respostas GET (páginas).
//      O cookie possui SameSite=Strict e httpOnly=false para que o frontend
//      possa ler seu valor via JavaScript.
//   2. Nos formulários de mutação (POST, PUT, DELETE, PATCH), o frontend lê
//      esse cookie e o envia no cabeçalho 'x-csrf-token'.
//   3. O middleware valida se o valor do header é idêntico ao do cookie.
//      Se não bater, rejeita com 403 Forbidden.
// ============================================================================

/**
 * Gera um token CSRF seguro.
 */
export function generateCsrfToken(): string {
  // 16 bytes aleatórios codificados em hex
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Valida se o token enviado pelo cabeçalho bate com o token do cookie.
 */
export function validateCsrf(cookieToken: string | null | undefined, headerToken: string | null | undefined): boolean {
  if (!cookieToken || !headerToken) return false
  if (cookieToken.length !== 32 || headerToken.length !== 32) return false
  
  // Comparação timing-safe simples
  let result = 0
  for (let i = 0; i < 32; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i)
  }
  return result === 0
}
