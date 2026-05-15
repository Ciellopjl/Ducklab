import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const empresas = await prisma.empresa.findMany({
    select: {
      id: true,
      slug: true,
      nome: true,
      diasAbertos: true
    }
  })
  console.log(JSON.stringify(empresas, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
