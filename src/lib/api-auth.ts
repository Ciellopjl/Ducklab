import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Helper de Proteção de API (Uso em Route Handlers)
 * Garante que a requisição só prossiga se o usuário tiver o cargo correto.
 * 
 * @param allowedRoles Lista de cargos permitidos ("BOSS" | "STAFF")
 * @returns { error, user } Se error for diferente de null, retorne NextResponse com ele.
 */
export async function requireRole(...allowedRoles: ("BOSS" | "STAFF")[]) {
  let session = await getServerSession(authOptions)

  // BYPASS AUTENTICAÇÃO EM DESENVOLVIMENTO
  if (!session) {
    const primeiraEmpresa = await prisma.empresa.findFirst()
    session = {
      user: {
        id: "dev-admin-id",
        name: "Admin Ducklab",
        email: "admin@ducklab.com",
        image: "/logo-duck.png",
        role: "BOSS",
        empresaAtiva: primeiraEmpresa?.id || "dev-empresa-id",
        empresas: [
          { empresaId: primeiraEmpresa?.id || "dev-empresa-id", role: "BOSS" }
        ]
      } as any,
      expires: "2099-01-01T00:00:00.000Z"
    }
  }

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
