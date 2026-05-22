import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSerial } from '@/server/utils/generateSerial'

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-verified') === 'true'
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { empresaId } = await req.json()
    
    if (!empresaId) {
      return NextResponse.json({ error: 'O ID da empresa é obrigatório' }, { status: 400 })
    }

    const serial = generateSerial()
    
    // Salva no banco imediatamente após gerar
    const licenca = await prisma.licenca.create({
      data: {
        serial,
        empresaId,
        criadoEm: new Date(),
        ativo: true,
      }
    })

    return NextResponse.json(licenca)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const licencas = await prisma.licenca.findMany({
      include: { empresa: { select: { nome: true } } },
      orderBy: { criadoEm: 'desc' }
    })
    return NextResponse.json(licencas)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
