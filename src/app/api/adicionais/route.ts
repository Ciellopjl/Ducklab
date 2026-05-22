import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, AdicionalCreateSchema } from '@/lib/validation'
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

    const adicionais = await prisma.adicional.findMany({
      where: { empresaId: tenantId },
      orderBy: { nome: 'asc' },
    })
    return NextResponse.json(adicionais)
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao buscar adicionais' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(AdicionalCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const adicional = await prisma.adicional.create({
      data: {
        empresaId: auth.tenantId,
        nome: data.nome,
        preco: data.preco,
        disponivel: data.disponivel ?? true,
      },
    })

    await registrarLog(auth.userEmail, 'ADICIONAL_CRIADO', `Criou o adicional "${adicional.nome}"`, undefined, auth.tenantId)
    return NextResponse.json(adicional, { status: 201 })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
