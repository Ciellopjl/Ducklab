import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL
  if (!email) {
    console.warn('⚠️ WARNING: ADMIN_EMAIL não configurada nas variáveis de ambiente.')
    return null
  }
  return email.toLowerCase().trim()
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24h
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const userEmail = user.email.toLowerCase().trim()
      
      try {
        const isRevoked = await prisma.revokedSession.findUnique({ 
          where: { email: userEmail } 
        })
        return !isRevoked
      } catch (e) {
        console.error("[SIGNIN_GUARD_ERROR]:", e)
        return false // Fail-safe: bloqueia se o banco estiver fora
      }
    },

    async jwt({ token, user, trigger }) {
      // FIX CRÍTICO: Executa se for login, update manual OU se o role sumiu do token por qualquer instabilidade de sessão
      if (user || trigger === 'update' || !token.role) {
        const userEmail = token.email?.toLowerCase()
        
        if (userEmail) {
          try {
            // Busca atômica para garantir integridade do role/empresa
            const dbUser = await prisma.usuario.findUnique({
              where: { email: userEmail },
              include: { empresas: true }
            })

            if (!dbUser) {
              token.role = 'REVOKED'
              return token
            }

            // Atualiza timestamp sem aguardar (non-blocking)
            prisma.usuario.update({
              where: { id: dbUser.id },
              data: { ultimoAcesso: new Date() }
            }).catch((e: unknown) => console.error("[TIMESTAMP_UPDATE_ERROR]:", e))

            const adminEmail = getAdminEmail()
            const isAdmin = userEmail === adminEmail
            
            token.sub = dbUser.id
            
            let tenants = dbUser.empresas.map((e: { empresaId: string; role: string }) => ({
              empresaId: e.empresaId,
              role: isAdmin ? 'BOSS' : e.role
            }))

            if (tenants.length > 0) {
              token.role = tenants[0].role
              token.empresaAtiva = tenants[0].empresaId
              token.empresas = tenants
            } else if (isAdmin) {
              const primeira = await prisma.empresa.findFirst()
              token.role = 'BOSS'
              if (primeira) {
                token.empresaAtiva = primeira.id
                token.empresas = [{ empresaId: primeira.id, role: 'BOSS' }]
              }
            } else {
              token.role = 'REVOKED'
            }
          } catch (e) {
            console.error("[JWT_REFRESH_ERROR]:", e)
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as any
        session.user.empresaAtiva = token.empresaAtiva as string
        session.user.empresas = token.empresas as any[]
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
