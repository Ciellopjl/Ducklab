'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAdminStore } from '@/store/adminStore'
import AdminSidebar from './AdminSidebar'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { HeartbeatProvider } from './HeartbeatProvider'

/**
 * AdminClientShell - Versão Ultra Estabilizada
 * Removido: SlimProgressBar, styled-jsx e memoização agressiva.
 */
function AdminClientShell({ 
  children, 
  session 
}: { 
  children: React.ReactNode, 
  session: any 
}) {
  const pathname = usePathname()
  const carregarDados = useAdminStore(state => state.carregarDados)
  const empresaAtivaNome = useAdminStore(state => state.empresaAtiva?.nome)
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const carregarIniciado = useRef(false)

  // Sincroniza dados do store apenas uma vez no mount
  useEffect(() => {
    const tenantId = session?.user?.empresaAtiva
    if (tenantId && !carregarIniciado.current) {
      carregarIniciado.current = true
      carregarDados()
    }
  }, [session, carregarDados])

  // Fecha a sidebar ao mudar de rota (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), [])

  return (
    <>
      <HeartbeatProvider />
      
      {/* Header Mobile */}
      <header className="lg:hidden h-14 bg-[#050505] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-[100]">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-gray-400 active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[10px] font-black text-white uppercase leading-none truncate max-w-[120px]">
              {empresaAtivaNome || 'Admin'}
            </p>
            <p className="text-[8px] text-orange-500 font-bold uppercase mt-0.5 tracking-tighter italic">Control Panel</p>
          </div>
        </div>
      </header>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} session={session} />

      {/* Conteúdo Principal */}
      {children}
    </>
  )
}

export default AdminClientShell
