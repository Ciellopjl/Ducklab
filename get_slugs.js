const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const empresas = await prisma.empresa.findMany({
    select: { nome: true, slug: true }
  })
  console.log(JSON.stringify(empresas, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
