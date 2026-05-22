import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, ProdutoUpdateSchema } from '@/lib/validation'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(ProdutoUpdateSchema, dados)
    if ('error' in parsed) {
      console.warn('[API_PRODUTO_UPDATE_VALIDATION_ERROR]', parsed.error)
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    // Tenant isolation: verificar pertencimento antes de atualizar
    const produtoAntigo = await prisma.produto.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!produtoAntigo) {
      return NextResponse.json({ erro: 'Produto não encontrado' }, { status: 404 })
    }

    const { data } = parsed

    // O preco base pode vir no payload ou usamos do produto existente
    const precoBaseFinal = data.preco !== undefined ? Number(data.preco) : produtoAntigo.preco

    // Resolve precoPromocional: deve ser maior que zero e MENOR que o preco original
    const precoPromo = data.emPromocao && data.precoPromocional != null && Number(data.precoPromocional) > 0 && Number(data.precoPromocional) < precoBaseFinal
      ? Number(data.precoPromocional)
      : null

    const produto = await prisma.produto.update({
      where: { id: params.id },
      data: {
        nome: data.nome,
        descricao: data.descricao ?? undefined,
        preco: data.preco !== undefined ? Number(data.preco) : undefined,
        imagem: data.imagem,
        categoriaId: data.categoriaId,
        badge: data.badge !== undefined ? data.badge : undefined,
        disponivel: data.disponivel,
        isPizza: data.isPizza || false,
        // Promoção
        emPromocao: data.emPromocao ?? false,
        precoPromocional: precoPromo,
        badgePromocao: data.emPromocao ? (data.badgePromocao || null) : null,
      },
      include: { categoria: true }
    })

    // Atualizar preços por tamanho se for pizza
    if (data.isPizza && data.precos) {
      await prisma.produtoPreco.deleteMany({ where: { produtoId: params.id } })
      await prisma.produtoPreco.createMany({
        data: data.precos.map((p) => ({
          produtoId: params.id,
          tamanhoId: p.tamanhoId,
          preco: Number(p.preco)
        }))
      })
    }

    let detalhe = `Editou o produto "${produto.nome}"`
    if (produtoAntigo.preco !== produto.preco) {
      detalhe += ` (Preço: R$ ${produtoAntigo.preco} → R$ ${produto.preco})`
    }
    await registrarLog(auth.userEmail, 'PRODUTO_EDITADO', detalhe, undefined, auth.tenantId)

    return NextResponse.json(produto)
  } catch (erro: any) {
    console.error('[API_PRODUTO_UPDATE_ERROR]', erro)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    // Tenant isolation
    const produto = await prisma.produto.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!produto) {
      return NextResponse.json({ erro: 'Produto não encontrado' }, { status: 404 })
    }

    await prisma.produto.delete({ where: { id: params.id } })
    await registrarLog(auth.userEmail, 'PRODUTO_DELETADO', `Excluiu o produto "${produto.nome}"`, undefined, auth.tenantId)

    return NextResponse.json({ mensagem: 'Excluído com sucesso' })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
