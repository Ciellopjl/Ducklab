import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { prisma } from '@/lib/prisma'
import { TenantProvider } from '@/components/TenantProvider'
import BottomNavigation from '@/components/BottomNavigation'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export const metadata: Metadata = {
  title: 'M.E BURGUE | Peça Online',
  description: 'O melhor burger artesanal da região. Delivery rápido e quentinho na sua porta!',
  icons: {
    icon: [
      { url: '/logo.png', href: '/logo.png' },
    ],
    apple: [
      { url: '/logo.png', href: '/logo.png' },
    ],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Busca a empresa principal (meburgue) para a raiz
  const empresa = await prisma.empresa.findFirst({
    where: { slug: 'meburgue' },
    select: {
      id: true,
      slug: true,
      nome: true,
      logo: true,
      whatsapp: true,
      corPrimaria: true,
      horarioAbertura: true,
      horarioFechamento: true,
      diasAbertos: true, // <-- Faltava este campo!
      taxaEntrega: true,
      endereco: true,
      chavePix: true,
    },
  })

  // Dados sanitizados para o Provider
  const empresaData = empresa ? {
    id: empresa.id,
    slug: empresa.slug,
    nome: empresa.nome,
    logo: empresa.logo,
    whatsapp: empresa.whatsapp,
    corPrimaria: empresa.corPrimaria,
    horarioAbertura: empresa.horarioAbertura,
    horarioFechamento: empresa.horarioFechamento,
    diasAbertos: empresa.diasAbertos || '0,1,2,3,4,5,6',
    taxaEntrega: empresa.taxaEntrega,
    endereco: empresa.endereco,
    chavePix: empresa.chavePix,
  } : null


  return (
    <html lang="pt-BR">
      <body
        className="
          min-h-screen bg-marca-fundo text-white font-sans antialiased
          overscroll-none
          [touch-action:manipulation]
        "
      >
        <Providers>
          {empresaData ? (
            <TenantProvider empresa={empresaData}>
              <div className="flex flex-col min-h-screen">
                <main className="flex-1 pb-24 md:pb-0">
                  {children}
                </main>
                <BottomNavigation />
              </div>
            </TenantProvider>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  )
}
