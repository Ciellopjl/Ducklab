import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function resetStats() {
  console.log('Iniciando reset de estatísticas...')
  
  try {
    // Deleta todos os pedidos
    const pedidos = await prisma.pedido.deleteMany({})
    console.log(`✅ ${pedidos.count} pedidos removidos.`)

    // Deleta todos os logs
    const logs = await prisma.log.deleteMany({})
    console.log(`✅ ${logs.count} logs removidos.`)

    console.log('---')
    console.log('Reset concluído com sucesso! Os números do dashboard agora devem estar em zero.')
  } catch (error) {
    console.error('❌ Erro ao resetar estatísticas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetStats()
