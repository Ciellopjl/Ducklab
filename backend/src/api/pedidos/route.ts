import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { safeParse, PedidoCreateSchema } from '@/lib/validation'
import { inicioDoDiaEmBrasilia } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
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
export async function POST(request: Request) {
  try {
    const dados = await request.json()
    
    // Validação Zod completa do pedido
    const parsed = safeParse(PedidoCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const tenantId = data.empresaId

    // Verificar se a empresa existe (previne pedidos para empresas fantasma)
    const empresa = await prisma.empresa.findUnique({ where: { id: tenantId } })
    if (!empresa) {
      return NextResponse.json({ erro: 'Empresa não encontrada' }, { status: 404 })
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
    return NextResponse.json(pedido, { status: 201 })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao criar pedido' }, { status: 500 })
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
