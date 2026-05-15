import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiGuard'

export async function POST(request: Request) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const { imageBase64 } = await request.json()
    if (!imageBase64) {
      return NextResponse.json({ erro: 'Imagem não fornecida' }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ erro: 'Chave da IA não configurada' }, { status: 403 })
    }

    const formData = new FormData()

    if (imageBase64.startsWith('http')) {
      // URL pública (ex: Cloudinary) — envia direto via image_url
      formData.append('image_url', imageBase64)
    } else {
      // Data URI base64
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      formData.append('image_file_b64', cleanBase64)
    }

    formData.append('size', 'auto')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
      body: formData
    })

    if (response.status === 402) return NextResponse.json({ erro: 'Créditos esgotados' }, { status: 402 })
    if (response.status === 403) return NextResponse.json({ erro: 'Chave inválida' }, { status: 403 })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ erro: 'Falha na IA', detalhes: errorText }, { status: response.status })
    }

    const data = await response.json()
    const resultB64 = data.data?.result_b64 || data.result_b64

    return NextResponse.json({ result: `data:image/png;base64,${resultB64}` })
  } catch (erro: any) {
    console.error('[REMOVE_BG_CRITICAL]:', erro)
    return NextResponse.json({ erro: 'Erro no processamento', detalhes: erro.message }, { status: 500 })
  }
}
