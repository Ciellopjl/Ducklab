// ============================================================================
// RATE LIMITER CENTRALIZADO — Ducklab Security
// ============================================================================
// Sliding window in-memory rate limiter para Next.js Edge/Node runtime.
// Não depende de Redis — usa Map com TTL automático por IP.
//
// Limites por perfil de rota:
//   auth    → 5 req / 15min  (login admin)
//   admin   → 30 req / 1min  (mutações autenticadas)
//   public  → 10 req / 5min  (pedidos, formulários públicos)
//   get     → 30 req / 1min  (consultas públicas)
// ============================================================================

export type RateLimitProfile = 'auth' | 'admin' | 'public' | 'get'

interface WindowEntry {
  count: number
  resetAt: number // Unix timestamp ms
}

// Map global persiste entre requisições no mesmo processo Node
const store = new Map<string, WindowEntry>()

// Limpeza periódica para evitar memory leak
// Roda a cada 5 minutos, remove entradas expiradas
let cleanupScheduled = false
function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

const PROFILES: Record<RateLimitProfile, { max: number; windowMs: number }> = {
  auth:   { max: 5,  windowMs: 15 * 60 * 1000 }, // 5 req / 15 min
  admin:  { max: 30, windowMs: 60 * 1000 },        // 30 req / 1 min
  public: { max: 10, windowMs: 5 * 60 * 1000 },    // 10 req / 5 min
  get:    { max: 30, windowMs: 60 * 1000 },         // 30 req / 1 min
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number // Unix seconds (para header RateLimit-Reset)
}

/**
 * Verifica se a requisição está dentro do limite.
 * @param ip     - IP do cliente (x-forwarded-for ou remoteAddress)
 * @param route  - Identificador da rota para namespace a chave
 * @param profile - Perfil de limite (auth | admin | public | get)
 */
export function checkRateLimit(
  ip: string,
  route: string,
  profile: RateLimitProfile
): RateLimitResult {
  scheduleCleanup()

  const { max, windowMs } = PROFILES[profile]
  const key = `${profile}:${route}:${ip}`
  const now = Date.now()

  let entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // Nova janela
    entry = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { allowed: true, limit: max, remaining: max - 1, resetAt: Math.ceil(entry.resetAt / 1000) }
  }

  entry.count += 1
  store.set(key, entry)

  const remaining = Math.max(0, max - entry.count)
  return {
    allowed: entry.count <= max,
    limit: max,
    remaining,
    resetAt: Math.ceil(entry.resetAt / 1000),
  }
}

/**
 * Extrai o IP do cliente de forma segura a partir dos headers Next.js.
 * Prioriza x-forwarded-for (CDN/Proxy) e cai em 'unknown'.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Retorna os headers RateLimit-* padrão para incluir na resposta.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'RateLimit-Limit':     String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset':     String(result.resetAt),
  }
}
