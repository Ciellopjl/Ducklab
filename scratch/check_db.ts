
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const empresas = await prisma.empresa.findMany()
  console.log(JSON.stringify(empresas, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
