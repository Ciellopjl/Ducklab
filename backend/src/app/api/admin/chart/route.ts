import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'

export const dynamic = 'force-dynamic'

/**
 * API de Dados do Gráfico — Timeline de Pedidos Individuais
 * Retorna cada pedido das últimas 24h para visualização granular
 */
export async function GET() {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const agora = new Date()
    const inicio24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000)

    // Busca pedidos individuais
    const pedidosDb = await prisma.pedido.findMany({
      where: {
        empresaId: auth.tenantId,
        criadoEm: { gte: inicio24h },
        excluido: false,
      },
      orderBy: { criadoEm: 'asc' },
      select: {
        id: true,
        criadoEm: true,
        total: true,
      },
    })

    const pedidos = pedidosDb.map(p => ({
      id: p.id,
      hora: p.criadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: p.criadoEm.getTime(),
      receita: Number(p.total) || 0
    }))

    const totalReceita = pedidos.reduce((acc, p) => acc + p.receita, 0)

    return NextResponse.json({ 
      pedidos,
      totalPedidos: pedidos.length,
      totalReceita,
      windowStart: inicio24h.getTime(),
      windowEnd: agora.getTime()
    })
  } catch (erro) {
    console.error('[CHART_API_ERROR]:', erro)
    return NextResponse.json({ erro: 'Erro ao gerar timeline' }, { status: 500 })
  }
}
