import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function updateBranding() {
  console.log('Atualizando nome da empresa no banco de dados...')
  
  try {
    const updated = await prisma.empresa.updateMany({
      where: {
        OR: [
          { nome: 'M.E BURGER' },
          { nome: 'M.E Burger' },
          { nome: 'ME BURGER' }
        ]
      },
      data: {
        nome: 'M.E BURGUE'
      }
    })
    
    console.log(`✅ ${updated.count} empresas atualizadas para 'M.E BURGUE'.`)
  } catch (error) {
    console.error('❌ Erro ao atualizar branding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateBranding()
