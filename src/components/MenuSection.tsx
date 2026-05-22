'use client'

import { useEffect, useState, useMemo } from 'react'
import { Produto, Categoria } from '@/data/types'
import ProdutoCard from './ProdutoCard'
import { motion } from 'framer-motion'
import { LayoutGrid } from 'lucide-react'
import { useTenant } from './TenantProvider'
import useSWR from 'swr'

export default function MenuSection() {
  const empresa = useTenant()
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas')
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''
  const { data: produtosData, isLoading: loadingProdutos } = useSWR(
    empresa.id ? `/api/produtos?empresaId=${empresa.id}` : null,
    (url) => fetch(url, { headers: { 'x-api-key': apiKey } }).then(r => r.json())
  )
  const { data: categoriasData, isLoading: loadingCategorias } = useSWR(
    empresa.id ? `/api/categorias?empresaId=${empresa.id}` : null,
    (url) => fetch(url, { headers: { 'x-api-key': apiKey } }).then(r => r.json())
  )

  const produtos = useMemo(() => Array.isArray(produtosData) ? produtosData : [], [produtosData])
  
  // Senior Rule: Sort categories (Burgers first, Drinks last)
  const categorias = useMemo(() => {
    if (!Array.isArray(categoriasData)) return []
    return [...categoriasData].sort((a, b) => {
      const labelA = a.label.toLowerCase()
      const labelB = b.label.toLowerCase()
      
      // Hamburguers go to the top
      if (labelA.includes('hamburguer') && !labelB.includes('hamburguer')) return -1
      if (!labelA.includes('hamburguer') && labelB.includes('hamburguer')) return 1
      
      // Drinks go to the bottom
      if (labelA.includes('bebida') && !labelB.includes('bebida')) return 1
      if (!labelA.includes('bebida') && labelB.includes('bebida')) return -1
      
      return 0
    })
  }, [categoriasData])

  const carregando = loadingProdutos || loadingCategorias

  const produtosFiltrados = useMemo(() => {
    let list = categoriaAtiva === 'todas' ? [...produtos] : produtos.filter((p) => p.categoriaId === categoriaAtiva)

    // Senior Rule: Sort products (Burgers first, Drinks last) even in "Todas"
    return list.sort((a, b) => {
      const labelA = categorias.find(c => c.id === a.categoriaId)?.label.toLowerCase() || ''
      const labelB = categorias.find(c => c.id === b.categoriaId)?.label.toLowerCase() || ''
      
      if (labelA.includes('hamburguer') && !labelB.includes('hamburguer')) return -1
      if (!labelA.includes('hamburguer') && labelB.includes('hamburguer')) return 1
      
      if (labelA.includes('bebida') && !labelB.includes('bebida')) return 1
      if (!labelA.includes('bebida') && labelB.includes('bebida')) return -1
      
      return 0
    })
  }, [produtos, categoriaAtiva, categorias])

  return (
    <section id="cardapio" className="section-padding bg-marca-fundo relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
            Nosso menu
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3">
            Cardápio <span className="text-gradient">Completo</span>
          </h2>
        </motion.div>

        {/* Filtro de categorias - Scroll horizontal no mobile */}
        <div className="flex flex-nowrap md:flex-wrap md:justify-center gap-3 mb-12 
                        overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
              ${
                categoriaAtiva === 'todas'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
          >
            <LayoutGrid className="w-4 h-4" /> Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`whitespace-nowrap flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                ${
                  categoriaAtiva === cat.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        {carregando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="h-48 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 skeleton" />
                  <div className="h-4 w-full skeleton" />
                  <div className="h-10 w-full skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto, index) => (
              <ProdutoCard key={produto.id} produto={produto} index={index} />
            ))}
          </div>
        )}

        {/* Mensagem quando não há produtos */}
        {!carregando && produtosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
