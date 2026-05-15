import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Busca os pedidos do dia atual
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const pedidosDb = await prisma.pedido.findMany({
      where: {
        criadoEm: {
          gte: hoje,
        },
      },
      orderBy: {
        criadoEm: 'asc',
      },
      select: {
        id: true,
        total: true,
        criadoEm: true,
        itens: true, // É uma string JSON
      },
    })

    const faturamentoTotal = pedidosDb.reduce((acc, curr) => acc + curr.total, 0)

    const historico = pedidosDb.map((p) => {
      let itemCount = 0
      try {
        const parsedItens = JSON.parse(p.itens)
        itemCount = Array.isArray(parsedItens) ? parsedItens.length : 0
      } catch (e) {
        itemCount = 0
      }

      return {
        id: p.id,
        horario: p.criadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        valor: p.total,
        itens: itemCount,
      }
    })

    return NextResponse.json({
      pedidos: pedidosDb.length,
      faturamento: faturamentoTotal,
      historico: historico,
    })
  } catch (error) {
    console.error('Erro na API de demanda:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
