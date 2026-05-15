import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function resetRoles() {
  const result = await prisma.empresaUsuario.updateMany({
    where: { 
      usuario: { email: { not: 'ciellolisboa023@gmail.com' } },
      role: 'BOSS'
    },
    data: { role: 'STAFF' }
  })
  console.log(`Reset ${result.count} accounts to STAFF.`)
}
resetRoles()
