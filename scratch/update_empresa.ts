
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
const { Pool } = pg
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString,
  ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : false
})
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  const empresa = await prisma.empresa.findFirst()
  if (empresa) {
    const updated = await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        nome: 'M.E burgue',
        slug: 'meburgue',
        logo: '/logo.png',
        corPrimaria: '#FF4D00', // Um laranja vibrante para hambúrguer
      }
    })
    console.log('Empresa atualizada:', JSON.stringify(updated, null, 2))
  } else {
    // Se não houver empresa, cria uma
    const created = await prisma.empresa.create({
      data: {
        nome: 'M.E burgue',
        slug: 'meburgue',
        logo: '/logo.png',
        corPrimaria: '#FF4D00',
        whatsapp: '5500000000000',
      }
    })
    console.log('Empresa criada:', JSON.stringify(created, null, 2))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
