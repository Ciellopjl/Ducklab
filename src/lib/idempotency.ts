// ============================================================================
// IDEMPOTENCY KEY STORE — Proteção contra Double POST
// ============================================================================
// Armazena respostas de operações de escrita por UUID (x-idempotency-key).
// Se a mesma key chegar duas vezes em 5 minutos, retorna o resultado cacheado
// sem reprocessar — previne pedidos duplicados por double-click ou retry de rede.
//
// O cliente DEVE:
//   1. Gerar um UUID v4 antes do submit: crypto.randomUUID()
//   2. Enviar como header: x-idempotency-key: <uuid>
//
// O servidor:
//   1. Chama checkIdempotency(key) — se já existe, retorna cached
//   2. Processa a operação normalmente
//   3. Chama storeIdempotency(key, responseBody, status) para cachear
//
// TTL: 5 minutos (300.000ms). Após expirar, a key pode ser reutilizada.
// ============================================================================

interface CachedResponse {
  body: unknown
  status: number
  expiresAt: number // Unix timestamp ms
}

// Map global — persiste entre requisições no mesmo processo
const cache = new Map<string, CachedResponse>()

const TTL_MS = 5 * 60 * 1000 // 5 minutos

// Limpeza a cada 10 minutos para evitar memory leak
let cleanupScheduled = false
function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of cache) {
      if (now > entry.expiresAt) cache.delete(key)
    }
  }, 10 * 60 * 1000)
}

/**
 * Verifica se existe uma resposta cacheada para a key.
 * @returns A resposta cacheada ou null se não existe / expirou.
 */
export function checkIdempotency(key: string | null | undefined): CachedResponse | null {
  if (!key || typeof key !== 'string' || key.length > 128) return null

  scheduleCleanup()

  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry
}

/**
 * Armazena a resposta de uma operação para a key fornecida.
 * @param key     - UUID enviado pelo cliente no header x-idempotency-key
 * @param body    - Objeto que será serializado como JSON na resposta cacheada
 * @param status  - HTTP status code da resposta original (ex: 201)
 */
export function storeIdempotency(key: string, body: unknown, status: number): void {
  if (!key || typeof key !== 'string' || key.length > 128) return
  cache.set(key, {
    body,
    status,
    expiresAt: Date.now() + TTL_MS,
  })
}

/**
 * Valida o formato de uma idempotency key.
 * Aceita UUID v4 ou string alfanumérica com hifens de até 128 chars.
 */
export function isValidIdempotencyKey(key: string | null | undefined): boolean {
  if (!key || typeof key !== 'string') return false
  if (key.length > 128) return false
  // UUID v4 ou qualquer string URL-safe
  return /^[a-zA-Z0-9\-_]{8,128}$/.test(key)
}
