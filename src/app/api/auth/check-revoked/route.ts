export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API Route: Verificar Revogação de Sessão
 * Usada pelo Middleware para contornar a limitação do Edge Runtime (que não acessa Prisma).
 * Protegida por um Segredo Interno.
 */
export async function POST(request: Request) {
  try {
    // SEGURANÇA: Apenas o Middleware do nosso próprio sistema pode chamar esta rota
    const secret = request.headers.get('x-middleware-secret')
    if (secret !== process.env.MIDDLEWARE_SECRET) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { email } = await request.json()
    if (!email) return NextResponse.json({ revoked: false })

    // Consulta na blocklist (RevokedSession)
    const isRevoked = await prisma.revokedSession.findUnique({
      where: { email: email.toLowerCase() }
    })

    return NextResponse.json({ revoked: !!isRevoked })
  } catch (erro) {
    console.error('[API_ERROR]: check-revoked', erro)
    return NextResponse.json({ revoked: false }, { status: 500 })
  }
}
