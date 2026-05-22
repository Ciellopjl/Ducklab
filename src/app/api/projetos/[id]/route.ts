import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, ProjetoUpdateSchema } from '@/lib/validation'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(ProjetoUpdateSchema, dados)
    if ('error' in parsed) {
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    // Tenant isolation: verificar pertencimento antes de atualizar
    const projetoAntigo = await prisma.projeto.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!projetoAntigo) {
      return NextResponse.json({ erro: 'Projeto não encontrado' }, { status: 404 })
    }

    const { data: fields } = parsed
    const projeto = await prisma.projeto.update({
      where: { id: params.id },
      data: {
        titulo: fields.titulo,
        descricao: fields.descricao,
        imagem: fields.imagem,
        categoria: fields.categoria,
        link: fields.link !== undefined ? fields.link : undefined,
        data: fields.data !== undefined ? fields.data : undefined,
        ordem: fields.ordem !== undefined ? fields.ordem : undefined,
        destaque: fields.destaque !== undefined ? fields.destaque : undefined,
      },
    })

    await registrarLog(auth.userEmail, 'PROJETO_EDITADO', `Editou o projeto "${projeto.titulo}"`, undefined, auth.tenantId)
    return NextResponse.json(projeto)
  } catch (erro: any) {
    console.error('[API_PROJETO_UPDATE_ERROR]', erro)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const projeto = await prisma.projeto.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!projeto) {
      return NextResponse.json({ erro: 'Projeto não encontrado' }, { status: 404 })
    }

    await prisma.projeto.delete({ where: { id: params.id } })
    await registrarLog(auth.userEmail, 'PROJETO_DELETADO', `Excluiu o projeto "${projeto.titulo}"`, undefined, auth.tenantId)

    return NextResponse.json({ mensagem: 'Excluído com sucesso' })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
