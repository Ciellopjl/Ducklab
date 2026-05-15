import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Definição das Rotas Sensíveis do Painel
 */
const BOSS_ONLY_PATHS = ["/admin/faturamento", "/admin/logs", "/admin/liberacao"]

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    const isApiRoute = pathname.startsWith("/api")

    // 1. Verificação de Autenticação
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ erro: "Não autenticado" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // 2. Lógica de RBAC (Role-Based Access Control)
    const isBossRoute = BOSS_ONLY_PATHS.some(path => pathname.startsWith(path))
    const isApiAdminRoute = pathname.startsWith("/api/admin")

    // Se a rota for exclusiva de BOSS e o usuário for STAFF
    if ((isBossRoute || isApiAdminRoute) && token.role !== "BOSS") {
      
      // STAFF tem permissão para algumas rotas de API específicas
      const staffAllowedApi = [
        "/api/admin/produtos", 
        "/api/admin/categorias", 
        "/api/admin/remove-bg",
        "/api/admin/uploads"
      ]
      const isAllowedStaffApi = staffAllowedApi.some(path => pathname.startsWith(path))

      // Bloqueia se for rota de UI do BOSS ou API de Admin não autorizada para STAFF
      if (isBossRoute || (isApiAdminRoute && !isAllowedStaffApi)) {
        if (isApiRoute) {
          return NextResponse.json({ erro: "Acesso negado: Requer nível BOSS" }, { status: 403 })
        }
        // Redireciona para o dashboard principal se tentar acessar UI proibida
        return NextResponse.redirect(new URL("/admin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/admin",
    },
  }
)

export const config = {
  matcher: [
    "/admin/faturamento", "/admin/faturamento/:path*",
    "/admin/logs", "/admin/logs/:path*",
    "/admin/liberacao", "/admin/liberacao/:path*",
    "/api/admin/:path*"
  ]
}
