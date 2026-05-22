export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const equipeSchema = z.object({
  nome: z.string().min(2, 'O nome é obrigatório'),
  cargo: z.string().min(2, 'O cargo é obrigatório'),
  descricao: z.string().min(5, 'A descrição é obrigatória'),
  imagem: z.string().min(1, 'A imagem é obrigatória'),
  github: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  ordem: z.number().int().default(0),
})

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-verified') === 'true'
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  
  try {
    const equipe = await prisma.equipe.findMany({
      orderBy: { ordem: 'asc' }
    })
    return NextResponse.json(equipe)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const validData = equipeSchema.parse(body)

    const membro = await prisma.equipe.create({
      data: validData
    })
    
    return NextResponse.json(membro)
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

    const validData = equipeSchema.parse(data)

    const membro = await prisma.equipe.update({
      where: { id },
      data: validData
    })
    
    return NextResponse.json(membro)
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

    await prisma.equipe.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
