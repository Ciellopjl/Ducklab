import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Empresa'
    `
    console.log('--- COLUNAS DA TABELA EMPRESA ---')
    console.log(JSON.stringify(columns, null, 2))
  } catch (err) {
    console.error('ERRO AO BUSCAR COLUNAS:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
