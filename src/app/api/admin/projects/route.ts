import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validação Zod estrita
const projectSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  imagem: z.string().min(1, 'A imagem é obrigatória'),
  categoria: z.string().min(1, 'A categoria é obrigatória'),
  link: z.string().url().optional().or(z.literal('')),
  data: z.string().optional().or(z.literal('')),
  ordem: z.number().int().default(0),
  destaque: z.boolean().default(false),
})

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-verified') === 'true'
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  
  try {
    const projetos = await prisma.projeto.findMany({
      orderBy: { ordem: 'asc' }
    })
    return NextResponse.json(projetos)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const validData = projectSchema.parse(body)

    const projeto = await prisma.projeto.create({
      data: {
        titulo: validData.titulo,
        descricao: validData.descricao,
        imagem: validData.imagem,
        categoria: validData.categoria,
        link: validData.link || null,
        data: validData.data || null,
        ordem: validData.ordem,
        destaque: validData.destaque,
      }
    })
    
    return NextResponse.json(projeto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, ...data } = body
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const validData = projectSchema.parse(data)

    const projeto = await prisma.projeto.update({
      where: { id },
      data: {
        titulo: validData.titulo,
        descricao: validData.descricao,
        imagem: validData.imagem,
        categoria: validData.categoria,
        link: validData.link || null,
        data: validData.data || null,
        ordem: validData.ordem,
        destaque: validData.destaque,
      }
    })
    
    return NextResponse.json(projeto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const id = req.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    await prisma.projeto.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
