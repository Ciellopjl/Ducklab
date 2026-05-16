import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { dateParaBrasilia } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/**
 * API de Faturamento — Nível Senior
 * - Apenas BOSS e STAFF autorizados
 * - Tenant isolation estrito
 * - Agrupamento por data no fuso de Brasília (America/Sao_Paulo)
 *   Evita bug de pedidos feitos após 21h aparecerem no dia seguinte (UTC)
 */
export async function GET() {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        empresaId: auth.tenantId,
        status: 'entregue'
      },
      select: {
        total: true,
        criadoEm: true
      },
      orderBy: { criadoEm: 'asc' }
    })

    const faturamentoPorDia = pedidos.reduce((acc: Record<string, number>, pedido) => {
      // ✅ Usa fuso de Brasília — antes usava .toISOString() que é UTC e adiantava o dia
      const data = dateParaBrasilia(pedido.criadoEm)
      acc[data] = (acc[data] || 0) + pedido.total
      return acc
    }, {})

    return NextResponse.json(faturamentoPorDia)
  } catch (error) {
    console.error('[FATURAMENTO_API_ERROR]:', error)
    return NextResponse.json({ erro: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
