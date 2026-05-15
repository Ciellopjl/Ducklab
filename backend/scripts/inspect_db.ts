import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    try {
        const empresas = await prisma.empresa.findMany()
        console.log('Empresas:', empresas.map(e => ({ id: e.id, nome: e.nome, slug: e.slug })))

        if (empresas.length > 0) {
            const empresa = empresas[0]
            if (empresa.nome === 'PedePorAqui') {
                await prisma.empresa.update({
                    where: { id: empresa.id },
                    data: { nome: 'M.E BURGER' }
                })
                console.log('Renamed PedePorAqui to M.E BURGER')
            }
        }

        const admins = await prisma.usuario.findMany({
            include: {
                empresas: true
            }
        })
        console.log('Usuarios no DB:', admins.map(u => ({ email: u.email, roleCount: u.empresas?.length })))
    } catch (e: any) {
        console.error("PRISMA ERROR DETAILED:", e.message)
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
