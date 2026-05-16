import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAuth('BOSS')
  if (auth instanceof NextResponse) return auth

  try {
    // @ts-ignore
    const logs = await prisma.log.findMany({
      where: { empresaId: auth.tenantId },
      orderBy: { criadoEm: 'desc' },
      take: 200
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('[LOGS API ERROR]:', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE() {
  const auth = await requireAuth('BOSS')
  if (auth instanceof NextResponse) return auth

  try {
    await prisma.log.deleteMany({
      where: { empresaId: auth.tenantId }
    })
    return NextResponse.json({ mensagem: 'Logs limpos com sucesso' })
  } catch (error) {
    console.error('[LOGS DELETE ERROR]:', error)
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}
