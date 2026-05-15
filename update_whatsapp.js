require('dotenv').config()
const { prisma } = require('./src/lib/prisma')

async function main() {
  console.log('🔄 Atualizando WhatsApp...')
  try {
    const empresa = await prisma.empresa.update({
      where: { slug: 'impperial' },
      data: { whatsapp: '559887673816' }
    })
    console.log('✅ WhatsApp atualizado para:', empresa.whatsapp)
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
