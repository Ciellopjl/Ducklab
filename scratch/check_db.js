require('dotenv').config()
const pg = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const empresas = await prisma.empresa.findMany()
  console.log('Empresas no banco:', JSON.stringify(empresas, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
