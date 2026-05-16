import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, CupomCreateSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const cupons = await prisma.cupom.findMany({
      where: { empresaId: auth.tenantId },
      orderBy: { criadoEm: 'desc' },
    })
    return NextResponse.json(cupons)
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao listar cupons' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await req.json()
    const parsed = safeParse(CupomCreateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const cupom = await prisma.cupom.create({
      data: {
        empresaId: auth.tenantId,
        codigo: data.codigo,
        tipo: data.tipo,
        valor: data.valor,
        pedidoMinimo: data.pedidoMinimo || 0,
        ativo: data.ativo ?? true,
        validade: data.validade ? new Date(data.validade) : null,
      },
    })
    
    await registrarLog(auth.userEmail, 'CUPOM_CRIADO', `Criou cupom "${cupom.codigo}"`, undefined, auth.tenantId)
    return NextResponse.json(cupom)
  } catch (erro: any) {
    if (erro.code === 'P2002') {
      return NextResponse.json({ erro: 'Já existe cupom com este código.' }, { status: 409 })
    }
    return NextResponse.json({ erro: 'Erro ao criar cupom' }, { status: 500 })
  }
}
