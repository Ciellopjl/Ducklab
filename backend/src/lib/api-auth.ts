import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Helper de Proteção de API (Uso em Route Handlers)
 * Garante que a requisição só prossiga se o usuário tiver o cargo correto.
 * 
 * @param allowedRoles Lista de cargos permitidos ("BOSS" | "STAFF")
 * @returns { error, user } Se error for diferente de null, retorne NextResponse com ele.
 */
export async function requireRole(...allowedRoles: ("BOSS" | "STAFF")[]) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { 
      error: NextResponse.json({ erro: "Sessão inválida ou expirada" }, { status: 401 }),
      user: null 
    }
  }

  const userRole = (session.user as any).role

  if (!allowedRoles.includes(userRole)) {
    return { 
      error: NextResponse.json({ erro: "Permissão insuficiente para esta operação" }, { status: 403 }),
      user: null 
    }
  }

  return { error: null, user: session.user }
}
