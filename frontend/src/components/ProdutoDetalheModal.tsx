'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Tag, ImageOff } from 'lucide-react'
import { Produto } from '@/data/types'
import { formatarPreco } from '@/lib/utils'
import { useState } from 'react'

interface ProdutoDetalheModalProps {
  produto: Produto | null
  aberto: boolean
  onClose: () => void
  onAdicionar: () => void
}

export default function ProdutoDetalheModal({
  produto,
  aberto,
  onClose,
  onAdicionar,
}: ProdutoDetalheModalProps) {
  const [imagemErro, setImagemErro] = useState(false)

  // Reset erro de imagem ao trocar produto
  useEffect(() => { setImagemErro(false) }, [produto?.id])

  // Scroll lock
  useEffect(() => {
    if (aberto) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [aberto])

  if (!produto) return null

  const precoExibido =
    produto.emPromocao && produto.precoPromocional && produto.precoPromocional > 0
      ? produto.precoPromocional
      : produto.preco

  const handleAdicionar = () => {
    onClose()
    // Pequeno delay para fechar o detalhe antes de abrir o de personalização
    setTimeout(() => onAdicionar(), 150)
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="detalhe-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end md:items-center justify-center"
        >
          {/* Overlay */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          />

          {/* Sheet */}
          <motion.div
            key="detalhe-content"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="relative w-full md:max-w-lg md:mx-4 bg-[#0e0e0e] border-t md:border border-white/10
                       rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col
                       max-h-[92dvh] md:max-h-[88vh]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* ── Indicador de swipe (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* ── Imagem hero */}
            <div className="relative w-full h-52 md:h-64 bg-black shrink-0 overflow-hidden">
              {!imagemErro ? (
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full h-full object-contain p-4 md:p-6"
                  onError={() => setImagemErro(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                  <ImageOff className="w-12 h-12 mb-2" />
                  <span className="text-xs">Sem imagem</span>
                </div>
              )}

              {/* Gradiente inferior */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0e0e0e] to-transparent" />

              {/* Badge promoção */}
              {produto.emPromocao && produto.badgePromocao && (
                <span className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-black
                                 uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                  {produto.badgePromocao}
                </span>
              )}

              {/* Botão fechar */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center
                           bg-black/60 backdrop-blur-sm rounded-full text-gray-400
                           hover:text-white transition-colors border border-white/10"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4">

              {/* Nome + preço */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight flex-1">
                  {produto.nome}
                </h2>
                <div className="flex flex-col items-end shrink-0">
                  {produto.emPromocao && produto.precoPromocional && produto.precoPromocional > 0 && (
                    <span className="text-xs text-gray-500 line-through font-mono">
                      {formatarPreco(produto.preco)}
                    </span>
                  )}
                  <span className="text-2xl font-black text-[#FF4D00] font-mono">
                    {formatarPreco(precoExibido)}
                  </span>
                </div>
              </div>

              {/* Divisor */}
              <div className="h-px bg-white/5" />

              {/* Descrição */}
              {produto.descricao && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                    Ingredientes
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {produto.descricao}
                  </p>
                </div>
              )}

              {/* Tag de categoria */}
              {produto.categoria?.nome && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-gray-600" />
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    {produto.categoria.nome}
                  </span>
                </div>
              )}

              <div className="h-2" />
            </div>

            {/* ── Footer */}
            <div className="shrink-0 px-5 pt-3 pb-4 bg-black/60 border-t border-white/5 backdrop-blur-sm">
              {produto.disponivel ? (
                <button
                  onClick={handleAdicionar}
                  className="w-full bg-[#FF4D00] hover:bg-[#ff6520] active:scale-95 text-black font-black
                             text-sm py-4 rounded-2xl flex items-center justify-center gap-2 transition-all
                             shadow-[0_8px_24px_-4px_rgba(255,77,0,0.4)]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  ADICIONAR AO CARRINHO
                </button>
              ) : (
                <div className="w-full bg-gray-800/50 text-gray-600 font-black text-sm py-4
                               rounded-2xl flex items-center justify-center">
                  Indisponível no momento
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
