import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      empresas: { empresaId: string; role: string }[]
      empresaAtiva: string | null
      role: string | null
    } & DefaultSession["user"]
  }
}
