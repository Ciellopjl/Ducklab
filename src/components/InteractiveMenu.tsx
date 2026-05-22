'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarrinhoStore } from '@/store/cartStore'
import { Produto, Categoria } from '@/data/types'
import { useTenant } from './TenantProvider'
import { Flame, Sun, Utensils, Plus, LayoutGrid } from 'lucide-react'
import useSWR from 'swr'

import ProdutoCard from './ProdutoCard'

interface InteractiveMenuProps {
  initialProdutos?: Produto[]
  initialCategorias?: Categoria[]
}

export default function InteractiveMenu({ initialProdutos = [], initialCategorias = [] }: InteractiveMenuProps) {
  const empresa = useTenant()
  
  const [activeCategoryId, setActiveCategoryId] = useState<string>('todas')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

  // Buscar produtos e categorias com SWR, usando os dados do servidor como base inicial
  const { data: produtosData, isLoading: loadingProdutos } = useSWR(
    empresa.id ? `/api/produtos?empresaId=${empresa.id}` : null,
    (url) => fetch(url, { headers: { 'x-api-key': apiKey } }).then(res => res.json()),
    { 
      refreshInterval: 10000,
      fallbackData: initialProdutos 
    }
  )

  const { data: categoriasData, isLoading: loadingCategorias } = useSWR(
    empresa.id ? `/api/categorias?empresaId=${empresa.id}` : null,
    (url) => fetch(url, { headers: { 'x-api-key': apiKey } }).then(res => res.json()),
    { 
      refreshInterval: 60000,
      fallbackData: initialCategorias
    }
  )

  const produtos = useMemo(() => Array.isArray(produtosData) ? produtosData : [], [produtosData])
  
  // Senior Rule: Sort categories (Burgers/Combos first, Drinks last)
  const categorias = useMemo(() => {
    if (!Array.isArray(categoriasData)) return []
    return [...categoriasData].sort((a, b) => {
      const labelA = a.label.toLowerCase()
      const labelB = b.label.toLowerCase()
      const nomeA = a.nome.toLowerCase()
      const nomeB = b.nome.toLowerCase()
      
      // Combos and Hamburgers go to the top
      const isPriorityA = labelA.includes('hambúrguer') || labelA.includes('burger') || nomeA.includes('combo')
      const isPriorityB = labelB.includes('hambúrguer') || labelB.includes('burger') || nomeB.includes('combo')

      if (isPriorityA && !isPriorityB) return -1
      if (!isPriorityA && isPriorityB) return 1
      
      // Drinks go to the bottom
      if (labelA.includes('bebida') && !labelB.includes('bebida')) return 1
      if (!labelA.includes('bebida') && labelB.includes('bebida')) return -1
      
      return 0
    })
  }, [categoriasData])
  
  // Force loading state until mounted to avoid hydration mismatch
  const carregando = !mounted || loadingProdutos || loadingCategorias

  const produtosFiltrados = useMemo(() => {
    let list = activeCategoryId === 'todas' ? [...produtos] : produtos.filter(p => p.categoriaId === activeCategoryId)
    
    // Senior Rule: Sort products (Burgers/Combos first, Drinks last) even in "Todas"
    return list.sort((a, b) => {
      // Find category labels for comparison
      const catA = categorias.find(c => c.id === a.categoriaId)
      const catB = categorias.find(c => c.id === b.categoriaId)
      
      const labelA = catA?.label.toLowerCase() || ''
      const labelB = catB?.label.toLowerCase() || ''
      const nomeA = catA?.nome.toLowerCase() || ''
      const nomeB = catB?.nome.toLowerCase() || ''
      
      const isPriorityA = labelA.includes('hambúrguer') || labelA.includes('burger') || nomeA.includes('combo')
      const isPriorityB = labelB.includes('hambúrguer') || labelB.includes('burger') || nomeB.includes('combo')

      if (isPriorityA && !isPriorityB) return -1
      if (!isPriorityA && isPriorityB) return 1
      
      if (labelA.includes('bebida') && !labelB.includes('bebida')) return 1
      if (!labelA.includes('bebida') && labelB.includes('bebida')) return -1
      
      return 0
    })
  }, [produtos, activeCategoryId, categorias])

  return (
    <section id="menu-interativo" className="bg-[#050200] py-12 md:py-20 px-3 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Título da Seção - Ajustado para iPhone 8 */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-6xl font-black text-white mb-2 md:mb-4 tracking-tighter"
          >
            NOSSO <span className="text-[#FF4D00]">CARDÁPIO</span>
          </motion.h2>
          <p className="text-xs md:text-base text-gray-400 font-medium">Escolha seu item favorito e peça pelo WhatsApp</p>
        </div>

        {/* Filtros de Categoria Dinâmicos - Scroll horizontal suave */}
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2 md:gap-3 mb-8 md:mb-12 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-3 px-3">
          <button
            onClick={() => setActiveCategoryId('todas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border whitespace-nowrap
              ${activeCategoryId === 'todas' 
                ? 'bg-[#FF4D00] border-[#FF4D00] text-black shadow-[0_8px_16px_-4px_rgba(255,77,0,0.4)] scale-105' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border whitespace-nowrap
                ${activeCategoryId === cat.id 
                  ? 'bg-[#FF4D00] border-[#FF4D00] text-black shadow-[0_8px_16px_-4px_rgba(255,77,0,0.4)] scale-105' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de Produtos - Otimizado para iPhone 8 (2 colunas) */}
        {carregando ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0c0500] border border-white/5 rounded-2xl md:rounded-3xl h-[220px] md:h-[400px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 lg:gap-8 mb-12 md:mb-20">
            <AnimatePresence mode="popLayout">
              {produtosFiltrados.map((product, index) => (
                <ProdutoCard key={product.id} produto={product} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Estado Vazio */}
        {!carregando && produtosFiltrados.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl font-medium">Nenhum produto cadastrado nesta categoria.</p>
          </div>
        )}
      </div>
    </section>
  )
}
