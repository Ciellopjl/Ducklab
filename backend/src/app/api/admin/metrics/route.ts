import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { inicioDoDiaEmBrasilia } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/**
 * API de Métricas — Nível Senior
 * - Proteção por role
 * - Tenant isolation total
 * - Performance via Promise.all
 * - Histórico preservado (ignora soft-delete em métricas financeiras)
 */
export async function GET() {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // ✅ Meia-noite no fuso de Brasília (antes usava UTC e adiantava o dia após 21h)
    const hoje = inicioDoDiaEmBrasilia()

    const [receitaHoje, pedidosHoje, pedidosPendentes] = await Promise.all([
      // 1. Receita de Hoje (Apenas entregues, somente pedidos do dia atual)
      prisma.pedido.aggregate({
        where: { 
            empresaId: auth.tenantId,
            status: 'entregue',
            criadoEm: { gte: hoje }
        },
        _sum: { total: true }
      }),

      // 2. Volume de Pedidos hoje (Analytics)
      prisma.pedido.count({
        where: {
          empresaId: auth.tenantId,
          criadoEm: { gte: hoje }
        }
      }),

      // 3. Cozinha Ativa (Fila de trabalho atual)
      prisma.pedido.count({
        where: {
          empresaId: auth.tenantId,
          excluido: false,
          status: { in: ['pendente', 'preparando', 'entregando'] }
        }
      })
    ])

    return NextResponse.json({
      receitaTotal: receitaHoje._sum.total || 0,
      pedidosHoje,
      cozinhaAtiva: pedidosPendentes
    })
  } catch (erro) {
    console.error('[METRICS_API_ERROR]:', erro)
    return NextResponse.json({ erro: 'Erro ao processar indicadores' }, { status: 500 })
  }
}
