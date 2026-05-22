require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

prisma.galeria.findMany({ orderBy: { criadoEm: 'desc' }, take: 5 })
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .catch(console.error)
  .finally(() => { pool.end(); prisma.$disconnect() })
