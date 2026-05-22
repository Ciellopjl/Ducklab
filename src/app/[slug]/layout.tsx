import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { TenantProvider } from '@/components/TenantProvider'
import Header from '@/components/Header'
import FooterSection from '@/components/FooterSection'
import BottomNavigation from '@/components/BottomNavigation'


export const dynamic = 'force-dynamic'

/* ─── Dynamic Metadata per Tenant ─── */
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const empresa = await prisma.empresa.findUnique({
    where: { slug: params.slug },
    select: { nome: true, logo: true, corPrimaria: true },
  })

  if (!empresa) return { title: 'Ducklab - Agência' }

  return {
    title: `${empresa.nome} | Cardápio Digital`,
    description: `Peça o melhor hambúrguer de Batalha no ${empresa.nome}.`,
    themeColor: empresa.corPrimaria || '#ff4b2b',
    icons: {
      icon: empresa.logo || '/favicon.ico',
    },
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  // Bug Fix 3: Trocar $queryRaw por findFirst para evitar cache do driver pg
  const empresa = await prisma.empresa.findFirst({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      nome: true,
      logo: true,
      whatsapp: true,
      corPrimaria: true,
      horarioAbertura: true,
      horarioFechamento: true,
      diasAbertos: true,
    },
  })

  if (!empresa) notFound()

  // Fallback seguro para diasAbertos
  const empresaData = {
    ...empresa,
    diasAbertos: empresa.diasAbertos || '0,1,2,3,4,5,6',
  }

  return (
    <TenantProvider empresa={empresaData}>
      <div className="min-h-screen flex flex-col bg-[#050505] text-white">
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <FooterSection />

        <BottomNavigation />
      </div>
    </TenantProvider>
  )
}
