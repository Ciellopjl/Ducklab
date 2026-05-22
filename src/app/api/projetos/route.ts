import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, ProjetoCreateSchema } from '@/lib/validation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimiter'
import { checkIdempotency, storeIdempotency, isValidIdempotencyKey } from '@/lib/idempotency'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Rate limiting para consultas públicas
  const ip = getClientIp(new Headers(Object.fromEntries(
    [...(request.headers as any).entries?.() ?? []]
  )))
  const rateLimitResult = checkRateLimit(ip, 'projetos-get', 'get')

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const empresaIdDaQuery = searchParams.get('empresaId')
    
    let tenantId = empresaIdDaQuery
    if (!tenantId) {
      const session = await getServerSession(authOptions)
      // @ts-ignore
      tenantId = session?.user?.empresaAtiva
      if (!tenantId) {
        const primeiraEmpresa = await prisma.empresa.findFirst()
        tenantId = primeiraEmpresa?.id || (process.env.NODE_ENV === 'development' ? 'dev-empresa-id' : null)
      }
    }

    if (!tenantId) {
      return NextResponse.json({ erro: 'Empresa não identificada' }, { status: 400 })
    }

    const projetos = await prisma.projeto.findMany({
      where: { 
        OR: [
          { empresaId: tenantId },
          { empresaId: null }
        ]
      },
      orderBy: { ordem: 'asc' },
    })

    return NextResponse.json(projetos, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao buscar projetos' }, { status: 500 })
  }
}

// POST — Criação de projeto
// Proteções:
//   1. requireAuth — apenas BOSS ou STAFF autenticados
//   2. Rate Limiting: 30 req/min por IP (perfil 'admin')
//   3. Idempotency Key: x-idempotency-key previne double POSTs
//   4. Validação Zod completa via ProjetoCreateSchema
export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  const ip = getClientIp(new Headers(Object.fromEntries(
    [...(request.headers as any).entries?.() ?? []]
  )))
  const rateLimitResult = checkRateLimit(ip, 'projetos', 'admin')
  const rlHeaders = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429, headers: rlHeaders }
    )
  }

  // ── Idempotency Key — Proteção contra Double POST ─────────────────────────
  const idempotencyKey = request.headers.get('x-idempotency-key')

  if (idempotencyKey !== null && !isValidIdempotencyKey(idempotencyKey)) {
    return NextResponse.json(
      { erro: 'x-idempotency-key inválida. Use um UUID v4.' },
      { status: 400, headers: rlHeaders }
    )
  }

  if (idempotencyKey) {
    const cached = checkIdempotency(idempotencyKey)
    if (cached) {
      return NextResponse.json(cached.body, {
        status: cached.status,
        headers: { ...rlHeaders, 'x-idempotency-replayed': 'true' },
      })
    }
  }

  try {
    const dados = await request.json()
    const parsed = safeParse(ProjetoCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400, headers: rlHeaders })
    }

    const { data: fields } = parsed
    const projeto = await prisma.projeto.create({
      data: {
        empresaId: auth.tenantId,
        titulo: fields.titulo,
        descricao: fields.descricao,
        imagem: fields.imagem,
        categoria: fields.categoria,
        link: fields.link || null,
        data: fields.data || null,
        ordem: fields.ordem || 0,
        destaque: fields.destaque ?? false,
      },
    })

    // Cachear resposta para reenvios com a mesma key
    if (idempotencyKey) {
      storeIdempotency(idempotencyKey, projeto, 201)
    }

    await registrarLog(auth.userEmail, 'PROJETO_CRIADO', `Criou o projeto "${projeto.titulo}"`, undefined, auth.tenantId)
    return NextResponse.json(projeto, { status: 201, headers: rlHeaders })
  } catch (erro: any) {
    console.error('[API_PROJETO_CREATE_ERROR]', erro)
    return NextResponse.json(
      { erro: 'Erro interno' },
      { status: 500, headers: rlHeaders }
    )
  }
}
