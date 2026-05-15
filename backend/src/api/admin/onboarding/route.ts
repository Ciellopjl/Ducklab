import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  try {
    const dados = await request.json()

    if (!dados.nome || !dados.slug) {
       return NextResponse.json({ erro: 'Nome e Slug são obrigatórios' }, { status: 400 })
    }

    // 1. Ver se já existe uma empresa com este slug
    const slugExiste = await prisma.empresa.findUnique({
      where: { slug: dados.slug }
    })

    if (slugExiste) {
      return NextResponse.json({ erro: 'Este link (slug) já está em uso por outra loja.' }, { status: 400 })
    }

    // 2. Buscar/Criar o usuário atual no DB
    let usuarioDb = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    })

    if (!usuarioDb) {
      usuarioDb = await prisma.usuario.create({
        data: {
          email: session.user.email,
          nome: session.user.name || '',
          imagem: session.user.image || '',
        }
      })
    }

    // 3. Criar a Empresa
    const novaEmpresa = await prisma.empresa.create({
      data: {
        nome: dados.nome,
        slug: dados.slug,
        whatsapp: dados.whatsapp,
        corPrimaria: '#FF4D00' // default orange M.E burgue
      }
    })

    // 4. Associar o Usuário à Empresa como BOSS
    await prisma.empresaUsuario.create({
      data: {
        empresaId: novaEmpresa.id,
        usuarioId: usuarioDb.id,
        role: 'BOSS'
      }
    })

    return NextResponse.json({ sucesso: true, empresa: novaEmpresa }, { status: 201 })
  } catch (erro) {
    console.error('Erro ao criar loja:', erro)
    return NextResponse.json({ erro: 'Erro interno ao criar loja' }, { status: 500 })
  }
}
