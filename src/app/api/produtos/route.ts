import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, sanitizeInput } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, ProdutoCreateSchema } from '@/lib/validation'
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

    const produtos = await prisma.produto.findMany({
      where: { empresaId: tenantId },
      include: { 
        categoria: {
          include: {
            // @ts-ignore
            sabores: true
          }
        },
        precos: {
          include: {
            tamanho: true
          }
        }
      },
      orderBy: { criadoEm: 'desc' },
    })
    return NextResponse.json(produtos, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(ProdutoCreateSchema, dados)
    if ('error' in parsed) {
      console.warn('[API_PRODUTO_CREATE_VALIDATION_ERROR]', parsed.error)
      return NextResponse.json({ erro: parsed.error }, { status: 400 })
    }

    const { data } = parsed

    // Resolve precoPromocional: deve ser maior que zero e MENOR que o preco original
    const precoPromoPost = data.emPromocao && data.precoPromocional != null && Number(data.precoPromocional) > 0 && Number(data.precoPromocional) < Number(data.preco)
      ? Number(data.precoPromocional)
      : null

    const produto = await prisma.produto.create({
      data: {
        empresaId: auth.tenantId,
        nome: data.nome,
        descricao: data.descricao || '',
        preco: Number(data.preco),
        imagem: data.imagem || '',
        categoriaId: data.categoriaId,
        badge: data.badge || null,
        disponivel: data.disponivel ?? true,
        isPizza: data.isPizza || false,
        precos: data.isPizza && data.precos ? {
          create: data.precos.map((p) => ({
            tamanhoId: p.tamanhoId,
            preco: Number(p.preco)
          }))
        } : undefined,
        // Promoção
        emPromocao: data.emPromocao ?? false,
        precoPromocional: precoPromoPost,
        badgePromocao: data.emPromocao ? (data.badgePromocao || null) : null,
      },
      include: { precos: true }
    })

    await registrarLog(auth.userEmail, 'PRODUTO_CRIADO', `Criou o produto "${produto.nome}"${produto.isPizza ? ' (Pizza)' : ''}`, undefined, auth.tenantId)
    return NextResponse.json(produto, { status: 201 })
  } catch (erro: any) {
    console.error('[API_PRODUTO_CREATE_ERROR]', erro)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
