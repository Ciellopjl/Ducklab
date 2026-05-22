import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { safeParse, TamanhoCreateSchema } from '@/lib/validation'
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
      if (!tenantId) {
        const primeiraEmpresa = await prisma.empresa.findFirst()
        tenantId = primeiraEmpresa?.id || null
      }
    }

    if (!tenantId) {
      return NextResponse.json({ erro: 'Empresa não identificada' }, { status: 400 })
    }

    const tamanhos = await prisma.tamanho.findMany({
      where: { empresaId: tenantId },
      orderBy: { ordem: 'asc' },
    })
    return NextResponse.json(tamanhos)
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao buscar tamanhos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(TamanhoCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const tamanho = await prisma.tamanho.create({
      data: {
        empresaId: auth.tenantId,
        nome: data.nome,
        sigla: data.sigla || null,
        maxSabores: data.maxSabores || 1,
        ordem: data.ordem || 0,
      },
    })

    return NextResponse.json(tamanho, { status: 201 })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
