export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-verified') === 'true'
}

// Listar todas as imagens da galeria
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const imagens = await prisma.galeria.findMany({
      orderBy: { criadoEm: 'desc' }
    })
    return NextResponse.json(imagens)
  } catch (error) {
    console.error('Erro ao buscar galeria:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Deletar uma imagem da galeria
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Buscar a imagem para pegar a URL do Cloudinary
    const imagem = await prisma.galeria.findUnique({ where: { id } })
    if (!imagem) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
    }

    // Tentar deletar do Cloudinary (extrair public_id da URL)
    try {
      const urlParts = imagem.url.split('/')
      const folderAndFile = urlParts.slice(urlParts.indexOf('ducklab')).join('/')
      const publicId = folderAndFile.replace(/\.[^/.]+$/, '')
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }
    } catch (cloudError) {
      console.error('Erro ao deletar do Cloudinary (continuando):', cloudError)
    }

    // Deletar do banco
    await prisma.galeria.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
