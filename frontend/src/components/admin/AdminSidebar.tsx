'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  Settings, 
  Ticket,
  TrendingUp,
  UserCheck,
  Clock,
  X,
  LogOut,
  History as HistoryIcon,
  Wrench,
  ArrowLeft
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useAdminStore } from '@/store/adminStore'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  session: any
}

const allMenuItems = [
  { href: '/admin', label: 'DASHBOARD', icon: LayoutDashboard, roles: ['BOSS'] },
  { href: '/admin/pedidos', label: 'PEDIDOS', icon: Clock, roles: ['BOSS', 'STAFF'] },
  { href: '/admin/produtos', label: 'PRODUTOS', icon: Package, roles: ['BOSS', 'STAFF'] },
  { href: '/admin/categorias', label: 'CATEGORIAS', icon: ListTree, roles: ['BOSS', 'STAFF'] },
  { href: '/admin/adicionais', label: 'ADICIONAIS', icon: Wrench, roles: ['BOSS', 'STAFF'] },
  { href: '/admin/cupons', label: 'CUPONS', icon: Ticket, roles: ['BOSS', 'STAFF'] },
  { href: '/admin/faturamento', label: 'FATURAMENTO', icon: TrendingUp, roles: ['BOSS'] },
  { href: '/admin/logs', label: 'LOGS DE ATIVIDADE', icon: HistoryIcon, roles: ['BOSS'] },
  { href: '/admin/liberacao', label: 'LIBERAÇÃO', icon: UserCheck, roles: ['BOSS'] },
  { href: '/admin/configuracoes', label: 'CONFIGURAÇÕES', icon: Settings, roles: ['BOSS'] },
]

function MenuItem({ item, onClose }: { item: any, onClose: () => void }) {
  const pathname = usePathname()
  const active = item.href === '/admin' 
    ? (pathname === '/admin' || pathname === '/admin/')
    : pathname.startsWith(item.href)

  const handleMouseEnter = () => {
    const resourceMap: any = {
      '/admin': 'pedidos',
      '/admin/pedidos': 'pedidos',
      '/admin/produtos': 'produtos',
      '/admin/categorias': 'categorias',
      '/admin/adicionais': 'adicionais',
      '/admin/cupons': 'cupons',
    }
    const resource = resourceMap[item.href]
    if (resource) {
      useAdminStore.getState().carregarRecurso(resource)
    }
  }

  return (
    <Link
      href={item.href}
      onMouseEnter={handleMouseEnter}
      onClick={onClose}
      className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-150 ${
        active
          ? 'bg-orange-600 text-white shadow-lg'
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <item.icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-400'}`} />
        <span className={`text-[14px] font-black tracking-tight ${active ? 'translate-x-1' : ''}`}>{item.label}</span>
      </div>
      {active && (
        <div className="w-2 h-2 rounded-full bg-white" />
      )}
    </Link>
  )
}

// Conteúdo interno reutilizado em desktop e mobile
function SidebarContent({ menuItems, onClose, empresaAtivaLogo, empresaAtivaNome, showCloseButton }: {
  menuItems: any[]
  onClose: () => void
  empresaAtivaLogo: string | undefined
  empresaAtivaNome: string | undefined
  showCloseButton: boolean
}) {
  return (
    <>
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black border border-orange-600 flex items-center justify-center shrink-0 overflow-hidden">
             <img
                src={empresaAtivaLogo || "/logo.png"}
                alt="Logo"
                className="w-full h-full object-cover"
              />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-white italic tracking-tighter leading-none whitespace-nowrap">
              {empresaAtivaNome || 'M.E ADMIN'}
            </h1>



          </div>
        </div>
        {showCloseButton && (
          <button onClick={onClose} className="p-2 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem 
            key={item.href} 
            item={item} 
            onClose={onClose} 
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-1 bg-[#050505]">
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Loja
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Sair do Painel
        </button>
      </div>
    </>
  )
}

export default function AdminSidebar({ isOpen, onClose, session }: SidebarProps) {
  const empresaAtivaLogo = useAdminStore(state => state.empresaAtiva?.logo)
  const empresaAtivaNome = useAdminStore(state => state.empresaAtiva?.nome)
  
  const userRole = session?.user?.role || 'STAFF'
  const menuItems = useMemo(() => allMenuItems.filter(item => item.roles.includes(userRole)), [userRole])

  return (
    <>
      {/* ══════════════════════════════════════════════
          DESKTOP: sidebar estática no fluxo do flex.
          NÃO usa position:fixed — não bloqueia cliques.
          ══════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 bg-[#050505] border-r border-white/5">
        <SidebarContent
          menuItems={menuItems}
          onClose={onClose}
          empresaAtivaLogo={empresaAtivaLogo}
          empresaAtivaNome={empresaAtivaNome}
          showCloseButton={false}
        />
      </aside>

      {/* ══════════════════════════════════════════════
          MOBILE: overlay + drawer fixos, apenas mobile.
          Renderizados com conditional para não existir
          no DOM quando fechados (zero z-index leak).
          ══════════════════════════════════════════════ */}
      <div className={`lg:hidden fixed inset-0 z-[200] transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop escuro */}
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Drawer */}
        <aside
          className={`absolute inset-y-0 left-0 w-[280px] bg-[#050505] flex flex-col h-full transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            menuItems={menuItems}
            onClose={onClose}
            empresaAtivaLogo={empresaAtivaLogo}
            empresaAtivaNome={empresaAtivaNome}
            showCloseButton={true}
          />
        </aside>
      </div>
    </>
  )
}
