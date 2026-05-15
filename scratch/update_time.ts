import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const empresa = await prisma.empresa.update({
    where: { slug: 'meburgue' },
    data: {
      horarioAbertura: '18:00',
      horarioFechamento: '00:00'
    }
  })
  console.log('Horário atualizado para a empresa:', empresa.nome)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
