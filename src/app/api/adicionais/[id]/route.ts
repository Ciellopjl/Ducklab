import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, AdicionalUpdateSchema } from '@/lib/validation'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const existente = await prisma.adicional.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!existente) {
      return NextResponse.json({ erro: 'Adicional não encontrado' }, { status: 404 })
    }

    const dados = await request.json()
    const parsed = safeParse(AdicionalUpdateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed
    const adicional = await prisma.adicional.update({
      where: { id: params.id },
      data: {
        nome: data.nome,
        preco: data.preco,
        disponivel: data.disponivel ?? true,
      }
    })

    await registrarLog(auth.userEmail, 'ADICIONAL_EDITADO', `Editou o adicional "${adicional.nome}"`, undefined, auth.tenantId)
    return NextResponse.json(adicional)
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao editar' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const adicional = await prisma.adicional.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!adicional) {
      return NextResponse.json({ erro: 'Adicional não encontrado' }, { status: 404 })
    }

    await prisma.adicional.delete({ where: { id: params.id } })
    await registrarLog(auth.userEmail, 'ADICIONAL_EXCLUIDO', `Excluiu o adicional "${adicional.nome}"`, undefined, auth.tenantId)

    return NextResponse.json({ ok: true })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao excluir' }, { status: 500 })
  }
}
