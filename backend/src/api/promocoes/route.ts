import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/promocoes - Listar promoções ativas
export async function GET() {
  try {
    const promocoes = await prisma.promocao.findMany()
    return NextResponse.json(promocoes)
  } catch (erro) {
    console.error('Erro ao buscar promoções:', erro)
    return NextResponse.json(
      { erro: 'Erro ao buscar promoções' },
      { status: 500 }
    )
  }
}
