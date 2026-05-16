import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  try {
    const userEmail = session.user.email.toLowerCase()
    
    // Atualiza apenas o timestamp no banco (Vercel safe: sem fs.appendFileSync)
    await prisma.usuario.update({
      where: { email: userEmail },
      data: { 
        ultimoAcesso: new Date() 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[HEARTBEAT_ERROR]:', error)
    return NextResponse.json({ erro: 'Internal Error' }, { status: 500 })
  }
}
