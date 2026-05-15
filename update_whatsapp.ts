import { prisma } from './src/lib/prisma'

async function main() {
  const result = await prisma.empresa.updateMany({
    data: { whatsapp: '5582988652775' }
  })
  console.log('Registros atualizados:', result.count)

  const empresas = await prisma.empresa.findMany({ select: { nome: true, whatsapp: true } })
  empresas.forEach(e => console.log(`Empresa: ${e.nome} | WhatsApp: ${e.whatsapp}`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
