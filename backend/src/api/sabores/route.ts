import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { safeParse, SaborCreateSchema } from '@/lib/validation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaIdDaQuery = searchParams.get('empresaId')
    
    let tenantId = empresaIdDaQuery
    if (!tenantId) {
      const session = await getServerSession(authOptions)
      // @ts-ignore
      tenantId = session?.user?.empresaAtiva
    }

    if (!tenantId) {
      return NextResponse.json({ erro: 'Empresa não identificada' }, { status: 400 })
    }

    const sabores = await prisma.sabor.findMany({
      where: { empresaId: tenantId },
      orderBy: { nome: 'asc' },
    })
    return NextResponse.json(sabores)
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao buscar sabores' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(SaborCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const sabor = await prisma.sabor.create({
      data: {
        empresaId: auth.tenantId,
        nome: data.nome,
        descricao: data.descricao || null,
        imagem: data.imagem || null,
        categoriaId: data.categoriaId || null,
        precoAdicional: data.precoAdicional || 0,
      },
    })

    return NextResponse.json(sabor, { status: 201 })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
