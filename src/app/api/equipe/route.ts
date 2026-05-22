import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimiter'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Rate limiting para consultas públicas
  const ip = getClientIp(new Headers(Object.fromEntries(
    [...(request.headers as any).entries?.() ?? []]
  )))
  const rateLimitResult = checkRateLimit(ip, 'equipe-get', 'get')

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    )
  }

  try {
    const equipe = await prisma.equipe.findMany({
      orderBy: { ordem: 'asc' },
    })

    return NextResponse.json(equipe, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (erro) {
    console.error('Failed to fetch equipe:', erro);
    return NextResponse.json({ erro: 'Erro ao buscar equipe', details: String(erro) }, { status: 500 })
  }
}
