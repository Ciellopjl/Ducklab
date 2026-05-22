export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-verified') === 'true'
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    const allowedVideos = ['video/mp4', 'video/webm', 'video/ogg']
    const allowedTypes = [...allowedImages, ...allowedVideos]
    const isVideo = allowedVideos.includes(file.type)

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use: JPG, PNG, WebP, GIF, SVG, MP4, WebM ou OGG' }, { status: 400 })
    }

    // Validar tamanho (max 10MB para imagens, 100MB para vídeos)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: isVideo ? 'Vídeo muito grande. Máximo: 100MB' : 'Arquivo muito grande. Máximo: 10MB' 
      }, { status: 400 })
    }

    // Converter para buffer base64 para upload no Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload para Cloudinary (resource_type 'auto' aceita imagens e vídeos)
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'ducklab/galeria',
      resource_type: 'auto',
      ...(isVideo ? {} : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] })
    })

    // Salvar na tabela Galeria do banco
    const galeria = await prisma.galeria.create({
      data: {
        nome: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
        url: result.secure_url,
      }
    })

    return NextResponse.json({
      id: galeria.id,
      nome: galeria.nome,
      url: galeria.url,
      criadoEm: galeria.criadoEm,
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
  }
}
