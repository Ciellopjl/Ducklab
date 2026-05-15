import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const tamanho = await prisma.tamanho.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!tamanho) {
      return NextResponse.json({ erro: 'Tamanho não encontrado' }, { status: 404 })
    }

    await prisma.tamanho.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao excluir' }, { status: 500 })
  }
}
