import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'
import AdminClientShell from '../../components/admin/AdminClientShell'

const NavLoading = () => (
  <div className="fixed top-0 left-0 right-0 h-0.5 bg-orange-600/10 overflow-hidden z-[999]">
    <div className="h-full bg-orange-600 w-full -translate-x-full animate-[progress_1.5s_infinite_linear]" />
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes progress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}} />
  </div>
)

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // @ts-ignore
  if (session?.user?.role === 'REVOKED') {
    redirect('/admin?error=AccessDenied')
  }

  // SE NÃO HÁ SESSÃO: Renderiza apenas o conteúdo (Página de Login) sem a Sidebar
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-sans selection:bg-orange-500/30 antialiased">
        <main className="w-full">
          <Suspense fallback={<NavLoading />}>
            {children}
          </Suspense>
        </main>
      </div>
    )
  }

  // SE HÁ SESSÃO: Renderiza a estrutura completa com Sidebar
  return (
    <div className="h-[100dvh] bg-black flex flex-col lg:flex-row font-sans selection:bg-orange-500/30 antialiased">
      <AdminClientShell session={session}>
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain">
          <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full flex-1">
             <Suspense fallback={<NavLoading />}>
                {children}
             </Suspense>
          </div>
        </main>
      </AdminClientShell>
    </div>
  )
}
