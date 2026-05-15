import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import InteractiveMenu from '@/components/InteractiveMenu'
import PromocoesSection from '@/components/PromocoesSection'
import FooterSection from '@/components/FooterSection'
import CartSidebar from '@/components/CartSidebar'

export const dynamic = 'force-dynamic'

export default async function RootHomePage() {
  // Busca a empresa principal
  const empresa = await prisma.empresa.findUnique({
    where: { slug: 'meburgue' },
    select: { id: true }
  })

  if (!empresa) return null

  // Busca TUDO no servidor (Paralelo para ser ultra rápido)
  const [promocoes, categorias, produtos] = await Promise.all([
    prisma.promocao.findMany({
      where: { empresaId: empresa.id },
    }),
    prisma.categoria.findMany({
      where: { empresaId: empresa.id },
      orderBy: { label: 'asc' },
    }),
    prisma.produto.findMany({
      where: { empresaId: empresa.id },
      include: {
        categoria: true,
        precos: { include: { tamanho: true } }
      },
      orderBy: { criadoEm: 'desc' },
    })
  ])

  // Sanitiza para serialização JSON (Next.js exige isso para Server Components)
  const data = JSON.parse(JSON.stringify({
    promocoes,
    categorias,
    produtos
  }))

  return (
    <>
      <Header />
      <CartSidebar />
      <main>
        <HeroSection />
        <InteractiveMenu 
          initialProdutos={data.produtos} 
          initialCategorias={data.categorias} 
        />
        <PromocoesSection promocoes={data.promocoes} />
      </main>
      <FooterSection />
    </>
  )
}
