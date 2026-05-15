import pg from 'pg'
const { Pool } = pg
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString,
  ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : false
})
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando atualização de marca...')
  const empresa = await prisma.empresa.findFirst()
  if (empresa) {
    console.log('Empresa encontrada:', empresa.slug)
    const updated = await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        nome: 'Hamburgueria Oxente!',
        slug: 'oxente',
        corPrimaria: '#F97316',
        logo: '/logo oxente.png'
      }
    })
    console.log('Empresa atualizada com sucesso:', updated.slug)
  } else {
    console.log('Nenhuma empresa encontrada para atualizar.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
