const { prisma } = require('./src/lib/prisma')
require('dotenv').config()

async function main() {
  const empresa = await prisma.empresa.findFirst({
    where: { slug: 'oxente' }
  })

  if (empresa) {
    await prisma.empresa.update({
      where: { id: empresa.id },
      data: { logo: '/logo oxente.png' }
    })
    console.log('✅ Logo atualizada para: /logo oxente.png')
  } else {
    console.log('❌ Empresa não encontrada.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
