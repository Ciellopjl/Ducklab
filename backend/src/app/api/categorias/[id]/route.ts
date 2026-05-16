import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, CategoriaUpdateSchema } from '@/lib/validation'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth
  
  try {
    const dados = await request.json()
    const parsed = safeParse(CategoriaUpdateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    // Tenant isolation
    const categoriaExistente = await prisma.categoria.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!categoriaExistente) {
      return NextResponse.json({ erro: 'Categoria não encontrada' }, { status: 404 })
    }

    const { data } = parsed
    const categoria = await prisma.categoria.update({
      where: { id: params.id },
      data: {
        nome: data.nome,
        label: data.label,
        icone: data.icone,
        adicionaisHabilitados: data.adicionaisHabilitados,
      },
    })

    await registrarLog(auth.userEmail, 'CATEGORIA_EDITADA', `Editou a categoria "${categoria.label}"`, undefined, auth.tenantId)
    return NextResponse.json(categoria)
  } catch (erro: any) {
    console.error('[API_CATEGORIA_UPDATE_ERROR]', erro)
    return NextResponse.json({ erro: erro.message || 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const categoriaExistente = await prisma.categoria.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!categoriaExistente) {
      return NextResponse.json({ erro: 'Categoria não encontrada' }, { status: 404 })
    }

    // Remover produtos vinculados para evitar erro de FK
    await prisma.produto.deleteMany({ where: { categoriaId: params.id } })
    await prisma.categoria.delete({ where: { id: params.id } })

    await registrarLog(auth.userEmail, 'CATEGORIA_DELETADA', `Excluiu a categoria "${categoriaExistente.label}"`, undefined, auth.tenantId)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
