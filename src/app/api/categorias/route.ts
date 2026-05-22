import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, CategoriaCreateSchema } from '@/lib/validation'
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

    const categorias = await prisma.categoria.findMany({
      where: { empresaId: tenantId },
      orderBy: { label: 'asc' },
    })
    // Sem cache: dados de admin precisam ser sempre frescos
    return NextResponse.json(categorias, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(CategoriaCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const categoria = await prisma.categoria.create({
      data: {
        empresaId: auth.tenantId,
        nome: data.nome,
        label: data.label,
        icone: data.icone || '🍔',
        adicionaisHabilitados: data.adicionaisHabilitados ?? true,
      },
    })
    
    await registrarLog(auth.userEmail, 'CATEGORIA_CRIADA', `Criou a categoria "${categoria.label}"`, undefined, auth.tenantId)
    return NextResponse.json(categoria, { status: 201 })
  } catch (erro: any) {
    if (erro.code === 'P2002') {
      return NextResponse.json({ erro: 'Já existe uma categoria com este nome.' }, { status: 409 })
    }
    console.error('[API_CATEGORIA_CREATE_ERROR]', erro)
    return NextResponse.json({ erro: erro.message || 'Erro interno' }, { status: 500 })
  }
}
