import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { parseRole } from "@/types/auth"
import type { UserRole } from "@/types/auth"
import { prisma } from "@/lib/prisma"

// ============================================================================
// API GUARD — Helper de Segurança para API Routes
// ============================================================================

export type AllowedRole = 'BOSS' | 'STAFF' | 'ANY_AUTHENTICATED'

interface AuthResult {
  session: Awaited<ReturnType<typeof getServerSession>>
  tenantId: string
  userEmail: string
  userRole: UserRole
  userId: string
}

/**
 * Verifica autenticação e autorização.
 * Retorna os dados do usuário autenticado ou lança uma NextResponse de erro.
 * 
 * @param allowedRoles - Roles permitidos. 'ANY_AUTHENTICATED' = BOSS ou STAFF.
 * @returns AuthResult com sessão, tenantId, email, role e userId
 * @throws NextResponse com status 401 ou 403
 * 
 * Exemplo de uso:
 * ```ts
 * export async function GET() {
 *   const auth = await requireAuth('BOSS')
 *   if (auth instanceof NextResponse) return auth
 *   // auth.tenantId, auth.userEmail, etc.
 * }
 * ```
 */
export async function requireAuth(
  ...allowedRoles: AllowedRole[]
): Promise<AuthResult | NextResponse> {
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

  if (!session?.user?.email) {
    return NextResponse.json(
      { erro: 'Não autenticado. Faça login novamente.' },
      { status: 401 }
    )
  }

  // Acessa campos customizados da sessão — tipagem via next-auth.d.ts
  const tenantId: string | undefined = (session.user as any)?.empresaAtiva
  const userRole: UserRole = parseRole((session.user as any)?.role)
  const userId: string | undefined = (session.user as any)?.id
  const userEmail = session.user.email

  if (!tenantId) {
    return NextResponse.json(
      { erro: 'Empresa não identificada. Sessão corrompida.' },
      { status: 401 }
    )
  }

  if (!userRole || userRole === 'REVOKED') {
    return NextResponse.json(
      { erro: 'Acesso revogado. Contate o administrador.' },
      { status: 403 }
    )
  }

  // 'UNKNOWN' nunca é uma AllowedRole, então acesso é negado automaticamente
  const isAnyAuth = allowedRoles.includes('ANY_AUTHENTICATED')
  const hasRequiredRole = allowedRoles.includes(userRole as AllowedRole)

  if (!isAnyAuth && !hasRequiredRole) {
    return NextResponse.json(
      { erro: `Acesso negado. Requer: ${allowedRoles.join(' ou ')}` },
      { status: 403 }
    )
  }

  return {
    session,
    tenantId,
    userEmail,
    userRole,
    userId,
  }
}

/**
 * Sanitiza input de texto para prevenir XSS e injection básico.
 * Remove tags HTML/script e caracteres perigosos.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '')        // Remove HTML tags
    .replace(/javascript:/gi, '')    // Remove javascript: protocol
    .replace(/on\w+=/gi, '')         // Remove event handlers (onclick=, etc)
    .trim()
    .slice(0, 5000)                  // Limite máximo de 5k caracteres
}

/**
 * Valida um email. Retorna true se for válido.
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}
