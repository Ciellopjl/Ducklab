
const { PrismaClient } = require('@prisma/client')
const pg = require('pg')
const { Pool } = pg
const { PrismaPg } = require('@prisma/adapter-pg')
require('dotenv').config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString,
  ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : false
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const count = await prisma.empresa.updateMany({
    data: {
      nome: 'M.E burgue',
      slug: 'meburgue',
      logo: '/logo.png',
      corPrimaria: '#FF4D00',
    }
  })
  console.log(`Updated ${count.count} companies.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
