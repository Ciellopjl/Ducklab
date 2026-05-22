import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { codigo, totalPedido, empresaId } = await req.json()
    
    if (!codigo || !empresaId) {
      return NextResponse.json({ erro: 'Código ou Empresa não informados' }, { status: 400 })
    }

    const cupom = await prisma.cupom.findFirst({
      where: { 
        codigo: codigo.toUpperCase(),
        empresaId: empresaId 
      },
    })

    if (!cupom) {
      return NextResponse.json({ erro: 'Cupom inválido' }, { status: 404 })
    }

    if (!cupom.ativo) {
      return NextResponse.json({ erro: 'Este cupom não está mais ativo' }, { status: 400 })
    }

    if (cupom.validade && new Date(cupom.validade) < new Date()) {
      return NextResponse.json({ erro: 'Este cupom expirou' }, { status: 400 })
    }

    if (totalPedido < cupom.pedidoMinimo) {
      return NextResponse.json({ 
        erro: `O valor mínimo para este cupom é R$ ${cupom.pedidoMinimo.toFixed(2).replace('.', ',')}` 
      }, { status: 400 })
    }

    // Calcular desconto
    let valorDesconto = 0
    if (cupom.tipo === 'porcentagem') {
      valorDesconto = (totalPedido * cupom.valor) / 100
    } else {
      valorDesconto = cupom.valor
    }

    return NextResponse.json({
      success: true,
      cupom: {
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: cupom.valor,
        descontoAplicado: valorDesconto
      }
    })

  } catch (erro) {
    console.error('Erro ao validar cupom:', erro)
    return NextResponse.json(
      { erro: 'Erro interno ao validar cupom' },
      { status: 500 }
    )
  }
}
