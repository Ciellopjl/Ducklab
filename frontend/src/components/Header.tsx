'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, PackageSearch } from 'lucide-react'
import { useCarrinhoStore } from '@/store/cartStore'
import { isStoreOpen } from '@/lib/storeStatus'
import { useTenant } from './TenantProvider'
import dynamic from 'next/dynamic'

const RastrearPedidoModal = dynamic(() => import('./RastrearPedidoModal'), { ssr: false })

export default function Header() {
  const empresa = useTenant()
  const [menuAberto, setMenuAberto] = useState(false)
  const [rastrearAberto, setRastrearAberto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toggleCarrinho, quantidadeTotal } = useCarrinhoStore()

  useEffect(() => {
    setMounted(true)
    setIsOpen(isStoreOpen(
      empresa.horarioAbertura ?? undefined, 
      empresa.horarioFechamento ?? undefined,
      empresa.diasAbertos ?? undefined
    ))
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [empresa.horarioAbertura, empresa.horarioFechamento])

  const links = [
    { href: `/${empresa.slug}`, label: 'Início' },
    { href: `/${empresa.slug}/#contato`, label: 'Contatos' },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-2xl shadow-2xl border-b border-white/5 py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex-1 flex justify-start items-center min-w-0">
              <Link href={`/${empresa.slug}`} className="flex items-center gap-2 md:gap-3 group min-w-0">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-[#FF4D00]/20 blur-md animate-pulse" />
                  <img
                    src="/logo.png"
                    alt={empresa.nome}
                    className="h-10 w-10 md:h-16 md:w-16 rounded-full object-cover border-2 border-[#FF4D00] 
                               relative z-10 transition-all duration-300 group-hover:scale-105 shadow-[0_0_20px_rgba(255,77,0,0.4)]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>

                <div className="flex flex-col text-left justify-center min-w-0">
                  <h1 className="text-sm md:text-xl font-display font-black text-[#FF4D00] italic uppercase leading-none tracking-tight truncate">
                    {empresa.nome || 'M.E BURGUE'}
                  </h1>
                  <p className="text-[7px] md:text-[11px] text-[#FF4D00] font-black uppercase tracking-[0.1em] mt-0.5 opacity-80 truncate">
                    O Sabor do Hambúrguer
                  </p>
                </div>
              </Link>
            </div>

            {/* Buttons removed per user request (moved to BottomNavigation) */}
            <div className="hidden md:flex items-center justify-end gap-3 md:gap-6 shrink-0">
               {/* Nav Desktop (Center) */}
               <nav className="flex items-center gap-8 mr-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-gray-300 hover:text-orange-400 
                               transition-colors duration-300 relative group flex items-center gap-2"
                  >
                    {link.label === 'Contatos' && (
                      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    )}
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 
                                    transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => setRastrearAberto(true)}
                className="flex items-center gap-2 p-3 md:p-4 rounded-2xl bg-white/5 hover:bg-[#FF4D00]/20 
                           border border-white/10 hover:border-[#FF4D00]/50
                           transition-all duration-300 group active:scale-90"
                aria-label="Meus Pedidos"
              >
                <PackageSearch className="w-6 h-6 md:w-7 md:h-7 text-gray-300 group-hover:text-[#FF4D00] transition-colors" />
                <span className="hidden lg:block text-sm font-black text-gray-300 group-hover:text-[#FF4D00] uppercase italic tracking-wider">
                  Meus Pedidos
                </span>
              </button>

              <button
                onClick={toggleCarrinho}
                className="relative p-3 md:p-4 rounded-2xl bg-white/5 hover:bg-[#FF4D00]/20 
                           border border-white/10 hover:border-[#FF4D00]/50
                           transition-all duration-300 group active:scale-90"
                aria-label="Abrir carrinho"
              >
                <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-gray-300 group-hover:text-[#FF4D00] transition-colors" />
                {mounted && quantidadeTotal() > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-[#FF4D00] text-black text-[12px] 
                               font-black rounded-full w-6 h-6 flex items-center justify-center
                               shadow-[0_0_15px_rgba(255,77,0,0.6)]"
                  >
                    {quantidadeTotal()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Floating (Desktop & Mobile) */}
        {menuAberto && (
          <div className="absolute top-24 right-4 md:right-8 w-64 bg-black/95 backdrop-blur-2xl 
                          border border-white/10 rounded-2xl shadow-2xl animate-fade-in z-50 
                          overflow-hidden ring-1 ring-white/5">
            <nav className="flex flex-col p-2 gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuAberto(false)}
                  className="text-gray-300 hover:text-orange-400 hover:bg-white/5 
                             px-5 py-3.5 rounded-xl transition-all duration-300 font-medium 
                             flex items-center justify-between group"
                >
                  {link.label}
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 scale-0 group-hover:scale-100 transition-transform duration-300" />
                </Link>
              ))}

              {/* Divisor */}
              <div className="h-px bg-white/5 mx-3 my-1" />

              {/* Acompanhar Pedido */}
              <button
                onClick={() => { setRastrearAberto(true); setMenuAberto(false) }}
                className="text-gray-300 hover:text-orange-400 hover:bg-white/5 
                           px-5 py-3.5 rounded-xl transition-all duration-300 font-medium 
                           flex items-center justify-between group w-full text-left"
              >
                <span className="flex items-center gap-2">
                  <PackageSearch className="w-4 h-4 text-[#FF4D00]" />
                  Meus Pedidos
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 scale-0 group-hover:scale-100 transition-transform duration-300" />
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Modal de rastreamento - FORA do <header> para não quebrar o z-index e o fixed position por causa do backdrop-filter */}
      {rastrearAberto && (
        <RastrearPedidoModal onClose={() => setRastrearAberto(false)} />
      )}
    </>
  )
}
