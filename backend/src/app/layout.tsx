// Backend API-only — layout mínimo necessário pelo Next.js
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
