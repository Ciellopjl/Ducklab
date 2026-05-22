import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'Ducklab Agência | Agência Criativa',
  description:
    'Inovação. Estratégia. Resultados. Agência de marketing digital e soluções criativas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: '#000000' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
