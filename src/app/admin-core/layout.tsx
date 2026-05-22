export const metadata = {
  title: 'Ducklab Admin',
  robots: 'noindex, nofollow'
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00ff41]/30 font-mono antialiased">
      {children}
    </div>
  )
}
