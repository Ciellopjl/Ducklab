import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- DIAGNÓSTICO E PROMOÇÃO DE BOSS ---')
  
  const usuarios = await prisma.usuario.findMany()
  console.log(`Encontrados ${usuarios.length} usuários.`)

  const empresa = await prisma.empresa.findFirst({ where: { slug: 'meburgue' } })
  
  if (!empresa) {
    console.log('❌ Empresa "meburgue" não encontrada!')
    return
  }

  for (const u of usuarios) {
    console.log(`Processando: ${u.email}...`)
    
    await prisma.empresaUsuario.upsert({
      where: {
        empresaId_usuarioId: {
          empresaId: empresa.id,
          usuarioId: u.id
        }
      },
      update: { role: 'BOSS' },
      create: {
        empresaId: empresa.id,
        usuarioId: u.id,
        role: 'BOSS'
      }
    })
    console.log(`✅ ${u.email} agora é BOSS da empresa ${empresa.nome}`)
  }

  const prodCount = await prisma.produto.count()
  console.log(`Total de produtos no banco: ${prodCount}`)

  console.log('--- FIM ---')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
