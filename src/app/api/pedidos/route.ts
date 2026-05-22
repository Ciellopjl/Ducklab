import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { safeParse, PedidoCreateSchema } from '@/lib/validation'
import { inicioDoDiaEmBrasilia } from '@/lib/utils'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimiter'
import { checkIdempotency, storeIdempotency, isValidIdempotencyKey } from '@/lib/idempotency'
import { verifyRecaptcha } from '@/lib/recaptcha'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const hoje = inicioDoDiaEmBrasilia()

    const pedidos = await prisma.pedido.findMany({
      where: { 
        empresaId: auth.tenantId,
        excluido: false,
        OR: [
          // Pedidos de hoje (independente do status)
          { criadoEm: { gte: hoje } },
          // Pedidos de dias anteriores que ainda estão ativos (pendente, preparando, entregando)
          { status: { in: ['pendente', 'preparando', 'entregando'] } }
        ]
      },
      orderBy: { criadoEm: 'desc' },
    })
    return NextResponse.json(pedidos)
  } catch (erro) {
    console.error('[PEDIDOS_GET_ERROR]:', erro)
    return NextResponse.json({ erro: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}

// POST é PÚBLICO — o cliente faz o pedido sem ter sessão
// Proteções:
//   1. Rate Limiting: 10 req/5min por IP (perfil 'public')
//   2. Idempotency Key: x-idempotency-key previne double POSTs
//   3. Validação Zod completa via PedidoCreateSchema
//   4. Google reCAPTCHA v3 para detecção de bots
export async function POST(request: Request) {
  // ── Rate Limiting ─────────────────────────────────────────────────────────
  const ip = getClientIp(new Headers(Object.fromEntries(
    [...(request.headers as any).entries?.() ?? []]
  )))
  const rateLimitResult = checkRateLimit(ip, 'pedidos', 'public')
  const rlHeaders = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429, headers: rlHeaders }
    )
  }

  // ── Idempotency Key — Proteção contra Double POST ─────────────────────────
  const idempotencyKey = request.headers.get('x-idempotency-key')

  // Se a key for enviada mas for inválida, rejeitar — previne bypass da proteção
  if (idempotencyKey !== null && !isValidIdempotencyKey(idempotencyKey)) {
    return NextResponse.json(
      { erro: 'x-idempotency-key inválida. Use um UUID v4.' },
      { status: 400, headers: rlHeaders }
    )
  }

  // Verificar se já existe resultado cacheado para esta key
  if (idempotencyKey) {
    const cached = checkIdempotency(idempotencyKey)
    if (cached) {
      // Retorna o resultado da primeira requisição sem reprocessar
      return NextResponse.json(cached.body, {
        status: cached.status,
        headers: {
          ...rlHeaders,
          'x-idempotency-replayed': 'true',
        },
      })
    }
  }

  try {
    const dados = await request.json()

    // ── Validação do Google reCAPTCHA v3 ──────────────────────────────────────
    const { recaptchaToken } = dados
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'criar_pedido')
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { erro: recaptchaResult.error || 'Falha na verificação anti-robô' },
        { status: 403, headers: rlHeaders }
      )
    }
    
    // Validação Zod completa do pedido
    const parsed = safeParse(PedidoCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400, headers: rlHeaders })
    }

    const { data } = parsed
    const tenantId = data.empresaId

    // Verificar se a empresa existe (previne pedidos para empresas fantasma)
    const empresa = await prisma.empresa.findUnique({ where: { id: tenantId } })
    if (!empresa) {
      return NextResponse.json(
        { erro: 'Empresa não encontrada' },
        { status: 404, headers: rlHeaders }
      )
    }

    // Gerar serial sequencial
    const totalPedidos = await prisma.pedido.count({
      where: { empresaId: tenantId }
    })
    const serial = (totalPedidos + 1).toString().padStart(4, '0')

    const pedido = await prisma.pedido.create({
      data: {
        empresaId: tenantId,
        nomeCliente: data.nomeCliente,
        telefone: data.telefone,
        endereco: data.endereco,
        bairro: data.bairro,
        itens: JSON.stringify(data.itens),
        total: data.total,
        formaPagamento: data.formaPagamento,
        trocoParaValor: data.trocoParaValor || null,
        observacoes: data.observacoes || null,
        serial,
        cupomCodigo: data.cupomCodigo || null,
        desconto: data.desconto || 0,
        totalFinal: data.totalFinal || data.total,
      },
    })

    // Cachear resposta para possíveis reenvios com a mesma key
    if (idempotencyKey) {
      storeIdempotency(idempotencyKey, pedido, 201)
    }

    return NextResponse.json(pedido, { status: 201, headers: rlHeaders })
  } catch (erro) {
    return NextResponse.json(
      { erro: 'Erro ao criar pedido' },
      { status: 500, headers: rlHeaders }
    )
  }
}

// DELETE = Soft Delete (arquivar) — BOSS only
export async function DELETE() {
  const auth = await requireAuth('BOSS')
  if (auth instanceof NextResponse) return auth

  try {
    await prisma.pedido.updateMany({
      where: { empresaId: auth.tenantId, excluido: false },
      data: { excluido: true }
    })
    return NextResponse.json({ mensagem: 'Pedidos arquivados com sucesso' })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao arquivar pedidos' }, { status: 500 })
  }
}
