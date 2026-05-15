import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiGuard'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

// Configuração do Cloudinary via variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const FOLDER = 'meburger'

export async function GET() {
  const auth = await requireAuth('ANY_AUTHENTICATED')
  if (auth instanceof NextResponse) return auth

  try {
    // Busca todas as imagens da pasta do projeto no Cloudinary
    const result = await cloudinary.api.resources({
      type:        'upload',
      prefix:      `${FOLDER}/`,
      max_results: 50,
      resource_type: 'image',
    })

    const imageFiles = (result.resources || []).map((r: any) => ({
      id:    r.public_id,
      name:  r.public_id.replace(`${FOLDER}/`, ''),
      url:   r.secure_url,
      atime: new Date(r.created_at).getTime(),
    }))

    // Mais recente primeiro
    imageFiles.sort((a: any, b: any) => b.atime - a.atime)

    return NextResponse.json(imageFiles.slice(0, 30))
  } catch (erro) {
    console.error('[UPLOADS_GET_ERROR]', erro)
    return NextResponse.json({ erro: 'Erro ao carregar galeria', detalhes: String(erro) || JSON.stringify(erro) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const { imageBase64, name } = await request.json()

    if (!imageBase64 || imageBase64.length < 100) {
      return NextResponse.json({ erro: 'Dados de imagem inválidos' }, { status: 400 })
    }

    // Valida formato base64
    const isValidBase64 = /^data:image\/(png|jpg|jpeg|webp|gif);base64,/.test(imageBase64)
    if (!isValidBase64) {
      return NextResponse.json({ erro: 'Formato de imagem inválido' }, { status: 400 })
    }

    // Estima tamanho (base64 é ~33% maior que o arquivo real)
    const base64Data = imageBase64.split(',')[1] || ''
    const estimatedBytes = Math.ceil((base64Data.length * 3) / 4)
    if (estimatedBytes > 10 * 1024 * 1024) {
      return NextResponse.json({ erro: 'Imagem muito pesada (máx 10MB)' }, { status: 413 })
    }

    // Upload direto via Data URI — Cloudinary aceita base64 nativamente
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder:       FOLDER,
      resource_type: 'image',
      // Otimizações automáticas
      quality:      'auto',
      fetch_format: 'auto',
    })

    return NextResponse.json({
      id:   uploadResult.public_id,
      name: name || uploadResult.original_filename || uploadResult.public_id,
      url:  uploadResult.secure_url,
    }, { status: 201 })
  } catch (erro) {
    console.error('[UPLOAD_ERROR]', erro)
    return NextResponse.json({ erro: 'Falha ao salvar imagem', detalhes: String(erro) || JSON.stringify(erro) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 })

    // O id aqui é o public_id do Cloudinary (ex: "meburger/uuid-nome")
    await cloudinary.uploader.destroy(id)
    return NextResponse.json({ mensagem: 'Imagem removida' })
  } catch (erro: any) {
    console.error('[UPLOAD_DELETE_ERROR]', erro)
    return NextResponse.json({ erro: 'Erro ao excluir imagem' }, { status: 500 })
  }
}
