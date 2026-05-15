import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const empresa = await prisma.empresa.findFirst()
    console.log('--- TESTE DE CONEXÃO ---')
    console.log('ID:', empresa?.id)
    console.log('Dias Abertos:', empresa?.diasAbertos)
    console.log('--- FIM DO TESTE ---')
  } catch (err) {
    console.error('ERRO NO TESTE:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
