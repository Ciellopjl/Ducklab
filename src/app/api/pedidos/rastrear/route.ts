import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Simple in-memory rate limiter: max 10 requests per IP per 60 seconds */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { erro: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' },
      { status: 429 }
    )
  }

  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() || ''
  const empresaSlug = searchParams.get('empresaSlug')?.trim()

  if (!empresaSlug) {
    return NextResponse.json({ erro: 'Parâmetro empresaSlug é obrigatório.' }, { status: 400 })
  }

  if (!q) {
    return NextResponse.json(
      { erro: 'Informe o número do pedido ou seu telefone.' },
      { status: 400 }
    )
  }

  // Resolve the empresaId from the slug
  const empresa = await prisma.empresa.findUnique({
    where: { slug: empresaSlug },
    select: { id: true },
  })

  if (!empresa) {
    return NextResponse.json({ erro: 'Loja não encontrada.' }, { status: 404 })
  }

  const soDigitos = q.replace(/[^0-9]/g, '')
  let formattedTelefone = soDigitos
  if (soDigitos.length === 11) {
    formattedTelefone = `(${soDigitos.substring(0, 2)}) ${soDigitos.substring(2, 7)}-${soDigitos.substring(7, 11)}`
  } else if (soDigitos.length === 10) {
    formattedTelefone = `(${soDigitos.substring(0, 2)}) ${soDigitos.substring(2, 6)}-${soDigitos.substring(6, 10)}`
  } else if (soDigitos.length === 8 || soDigitos.length === 9) {
    formattedTelefone = soDigitos.length === 9 ? `${soDigitos.substring(0,5)}-${soDigitos.substring(5)}` : `${soDigitos.substring(0,4)}-${soDigitos.substring(4)}`
  }

  const termoBusca = q.replace('#', '').trim()

  const orConditions: any[] = [
    { telefone: { contains: q } },
    { id: { startsWith: termoBusca } },
    { id: { startsWith: termoBusca.toLowerCase() } },
    { id: { startsWith: termoBusca.toUpperCase() } }
  ]
  
  if (soDigitos) {
    orConditions.push({ telefone: { contains: soDigitos } })
    if (formattedTelefone !== soDigitos) {
      orConditions.push({ telefone: { contains: formattedTelefone } })
    }
    // Se for 4 dígitos ou menos, pode ser o serial numérico (ex: 0005)
    if (soDigitos.length <= 4) {
      orConditions.push({ serial: soDigitos.padStart(4, '0') })
    }
  }

  // Build query
  const pedido = await prisma.pedido.findFirst({
    where: {
      empresaId: empresa.id,
      excluido: false,
      OR: orConditions
    },
    select: {
      id: true,
      serial: true,
      nomeCliente: true,
      status: true,
      itens: true,
      total: true,
      totalFinal: true,
      desconto: true,
      formaPagamento: true,
      criadoEm: true,
      endereco: true,
      bairro: true,
    },
    orderBy: { criadoEm: 'desc' },
  })

  if (!pedido) {
    return NextResponse.json(
      { erro: 'Nenhum pedido encontrado com os dados informados.' },
      { status: 404 }
    )
  }

  // Parse itens JSON safely
  let itens: unknown[] = []
  try {
    itens = JSON.parse(pedido.itens)
  } catch {
    itens = []
  }

  return NextResponse.json({
    id: pedido.id,
    serial: pedido.serial,
    nomeCliente: pedido.nomeCliente,
    status: pedido.status,
    itens,
    total: pedido.total,
    totalFinal: pedido.totalFinal ?? pedido.total,
    desconto: pedido.desconto,
    formaPagamento: pedido.formaPagamento,
    criadoEm: pedido.criadoEm,
    endereco: pedido.endereco,
    bairro: pedido.bairro,
  })
}
