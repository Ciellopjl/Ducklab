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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('error', function(event) {
            var div = document.createElement('div');
            div.id = 'debug-error-overlay';
            div.style.position = 'fixed';
            div.style.top = '10px';
            div.style.left = '10px';
            div.style.right = '10px';
            div.style.backgroundColor = '#ff0055';
            div.style.color = '#ffffff';
            div.style.padding = '20px';
            div.style.fontFamily = 'monospace';
            div.style.fontSize = '12px';
            div.style.zIndex = '999999';
            div.style.borderRadius = '8px';
            div.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
            div.style.whiteSpace = 'pre-wrap';
            div.innerText = 'UNCAUGHT ERROR:\\n' + event.message + '\\nAt: ' + event.filename + ':' + event.lineno + ':' + event.colno + '\\nStack:\\n' + (event.error ? event.error.stack : 'No stack');
            document.body.appendChild(div);
          });
          window.addEventListener('unhandledrejection', function(event) {
            var div = document.createElement('div');
            div.id = 'debug-reject-overlay';
            div.style.position = 'fixed';
            div.style.top = '10px';
            div.style.left = '10px';
            div.style.right = '10px';
            div.style.backgroundColor = '#ff5500';
            div.style.color = '#ffffff';
            div.style.padding = '20px';
            div.style.fontFamily = 'monospace';
            div.style.fontSize = '12px';
            div.style.zIndex = '999999';
            div.style.borderRadius = '8px';
            div.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
            div.style.whiteSpace = 'pre-wrap';
            div.innerText = 'UNHANDLED REJECTION:\\n' + event.reason;
            document.body.appendChild(div);
          });
        ` }} />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#000000' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
