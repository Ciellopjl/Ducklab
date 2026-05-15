'use client'

import { motion } from 'framer-motion'
import { Plus, ImageOff, CheckCircle } from 'lucide-react'
import { Produto } from '@/data/types'
import { formatarPreco } from '@/lib/utils'
import { useCarrinhoStore } from '@/store/cartStore'
import { useState } from 'react'
import ProdutoSelectionModal from './ProdutoSelectionModal'
import ProdutoDetalheModal from './ProdutoDetalheModal'

interface ProdutoCardProps {
  produto: Produto
  index?: number
}

export default function ProdutoCard({ produto, index = 0 }: ProdutoCardProps) {
  const { adicionarItem } = useCarrinhoStore()
  const [imagemErro, setImagemErro] = useState(false)
  const [adicionado, setAdicionado] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [detalheAberto, setDetalheAberto] = useState(false)

  const handleAdicionar = () => {
    // Usa o preço promocional se ativo e disponível
    const precoFinal = produto.emPromocao && produto.precoPromocional && produto.precoPromocional > 0
      ? produto.precoPromocional
      : produto.preco

    if (
      !produto.isPizza &&
      (!produto.precos || produto.precos.length === 0) &&
      (produto.categoria?.nome === 'bebidas' || produto.categoriaId === 'bebidas')
    ) {
      adicionarItem({ produto, quantidade: 1, precoUnitario: precoFinal })
      setAdicionado(true)
      setTimeout(() => setAdicionado(false), 1000)
    } else {
      setModalAberto(true)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-card overflow-hidden group card-hover flex flex-col cursor-pointer"
        onClick={() => produto.disponivel && setDetalheAberto(true)}
      >
        {/* Imagem - Altura ajustada para telas pequenas */}
        <div className="relative h-28 md:h-56 overflow-hidden bg-marca-cinzaEscuro">
          {!imagemErro ? (
            <img
              src={produto.imagem}
              alt={produto.nome}
              className="w-full h-full object-contain object-center p-2 md:p-4 transition-transform duration-500
                         group-hover:scale-110"
              onError={() => setImagemErro(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
              <ImageOff className="w-6 h-6 md:w-12 md:h-12 mb-1" />
              <span className="text-[8px] md:text-xs">Sem imagem</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Badge de promoção */}
          {produto.emPromocao && produto.badgePromocao ? (
            <span
              className="absolute top-1.5 left-1.5 md:top-4 md:left-4 bg-orange-500 text-white
                         text-[7px] md:text-[10px] font-black uppercase tracking-widest
                         px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border border-orange-400/50 animate-pulse"
            >
              {produto.badgePromocao}
            </span>
          ) : null}

          {/* Preço sobre a imagem - Ajustado para iPhone 8 */}
          <div className="absolute bottom-1.5 right-1.5 md:bottom-4 md:right-4 flex flex-col items-end">
            {produto.emPromocao && produto.precoPromocional && produto.precoPromocional > 0 ? (
              <>
                <span className="text-[8px] md:text-xs font-bold text-white/50 line-through font-mono">
                  {formatarPreco(produto.preco)}
                </span>
                <span
                  className="bg-orange-500 text-white font-display font-black
                             text-xs sm:text-sm md:text-lg px-2 md:px-4 py-0.5 md:py-1.5
                             rounded-md md:rounded-xl shadow-xl shadow-orange-500/30"
                >
                  {formatarPreco(produto.precoPromocional)}
                </span>
              </>
            ) : (
              <span
                className="bg-[#FF4D00] text-black font-display font-black
                           text-xs sm:text-sm md:text-lg px-2 md:px-4 py-0.5 md:py-1.5
                           rounded-md md:rounded-xl shadow-xl shadow-[#FF4D00]/20"
              >
                {formatarPreco(produto.preco)}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5 md:p-5 flex-1 flex flex-col">
          <h3 className="text-xs sm:text-sm md:text-xl font-display font-black text-white mb-1 md:mb-2
                         group-hover:text-[#FF4D00] transition-colors line-clamp-2 uppercase tracking-tighter">
            {produto.nome}
          </h3>

          <p className="hidden md:block text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
            {produto.descricao}
          </p>

          {/* Botão adicionar - Compacto no mobile */}
          <button
            onClick={(e) => { e.stopPropagation(); handleAdicionar() }}
            disabled={!produto.disponivel}
            className={`w-full flex items-center justify-center gap-1.5 md:gap-3
                       py-2.5 md:py-5 rounded-xl md:rounded-2xl mt-auto
                       font-black text-[9px] md:text-sm tracking-[0.1em] transition-all duration-500 active:scale-95
                       ${adicionado
              ? 'bg-green-600 text-white'
              : produto.disponivel
                ? 'bg-white/5 border border-white/10 text-white hover:bg-[#FF4D00] hover:text-black hover:border-[#FF4D00] shadow-[0_10px_20px_-5px_rgba(255,77,0,0.2)]'
                : 'bg-gray-800/50 text-gray-600 cursor-not-allowed border-transparent'
            }`}
          >
            {adicionado ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5" />
                OK!
              </>
            ) : produto.disponivel ? (
              <>
                <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
                ADICIONAR
              </>
            ) : (
              'OFF'
            )}
          </button>
        </div>
      </motion.div>

      <ProdutoDetalheModal
        produto={produto}
        aberto={detalheAberto}
        onClose={() => setDetalheAberto(false)}
        onAdicionar={() => setModalAberto(true)}
      />

      <ProdutoSelectionModal
        produto={produto}
        aberto={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </>
  )
}
