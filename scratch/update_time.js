const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const empresa = await prisma.empresa.update({
      where: { slug: 'meburgue' },
      data: {
        horarioAbertura: '18:00',
        horarioFechamento: '00:00'
      }
    })
    console.log('Horário atualizado com sucesso:', empresa.nome)
  } catch (err) {
    console.error('Erro ao atualizar:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
