export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, CupomUpdateSchema } from '@/lib/validation'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const cupomExistente = await prisma.cupom.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!cupomExistente) {
      return NextResponse.json({ erro: 'Cupom não encontrado' }, { status: 404 })
    }

    const dados = await req.json()
    const parsed = safeParse(CupomUpdateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const cupom = await prisma.cupom.update({
      where: { id: params.id },
      data: {
        codigo: data.codigo,
        tipo: data.tipo,
        valor: data.valor,
        pedidoMinimo: data.pedidoMinimo,
        ativo: data.ativo,
        validade: data.validade ? new Date(data.validade) : null,
      },
    })
    
    await registrarLog(auth.userEmail, 'CUPOM_EDITADO', `Editou cupom "${cupom.codigo}"`, undefined, auth.tenantId)
    return NextResponse.json(cupom)
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao editar cupom' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const cupomExistente = await prisma.cupom.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!cupomExistente) {
      return NextResponse.json({ erro: 'Cupom não encontrado' }, { status: 404 })
    }

    await prisma.cupom.delete({ where: { id: params.id } })
    await registrarLog(auth.userEmail, 'CUPOM_DELETADO', `Excluiu cupom "${cupomExistente.codigo}"`, undefined, auth.tenantId)
    
    return NextResponse.json({ mensagem: 'Cupom excluído com sucesso' })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao excluir cupom' }, { status: 500 })
  }
}
