import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Configuração Definitiva usando o driver padrão do PostgreSQL
// Compatível com Neon e estável em qualquer ambiente Node.js

const DATABASE_URL = process.env.DATABASE_URL?.trim()

if (!DATABASE_URL) {
  throw new Error('❌ DATABASE_URL ausente no .env')
}

// Cast tipado do globalThis para evitar erros de TS strict mode
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const pool = new Pool({ connectionString: DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
