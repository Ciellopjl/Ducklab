import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.galeria.count()
  console.log(`Total de imagens na galeria: ${count}`)

  const images = await prisma.galeria.findMany({
    select: {
      id: true,
      nome: true,
      url: true // This will fetch everything
    }
  })

  let totalSize = 0
  images.forEach(img => {
    totalSize += img.url.length
  })

  console.log(`Tamanho total das imagens no DB: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  if (count > 0) {
    console.log(`Tamanho médio: ${(totalSize / count / 1024 / 1024).toFixed(2)} MB`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
