'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Check, Plus, Minus } from 'lucide-react'
import { Produto, Tamanho, Sabor, Adicional, ItemCarrinho } from '@/data/types'
import { formatarPreco } from '@/lib/utils'
import { useCarrinhoStore } from '@/store/cartStore'
import useSWR from 'swr'
import { useTenant } from './TenantProvider'

interface ProdutoSelectionModalProps {
  produto: Produto
  aberto: boolean
  onClose: () => void
}

export default function ProdutoSelectionModal({ produto, aberto, onClose }: ProdutoSelectionModalProps) {
  const empresa = useTenant()
  const { adicionarItem } = useCarrinhoStore()

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho | null>(
    (produto.precos && produto.precos.length > 0 && produto.precos[0].tamanho)
      ? (produto.precos[0].tamanho as Tamanho)
      : null
  )
  const [saboresSelecionados, setSaboresSelecionados] = useState<Sabor[]>([])
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<Adicional[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  const { data: adicionaisData } = useSWR(
    aberto && empresa.id ? `/api/adicionais?empresaId=${empresa.id}` : null,
    (url) => fetch(url).then(r => r.json())
  )
  const adicionaisDisponiveis = Array.isArray(adicionaisData)
    ? adicionaisData.filter(a => a.disponivel)
    : []

  const saboresDisponiveis = produto.categoria?.sabores || []

  const precoBase = useMemo(() => {
    if (!tamanhoSelecionado) {
      // Usa preço promocional se disponível
      if (produto.emPromocao && produto.precoPromocional && produto.precoPromocional > 0) {
        return produto.precoPromocional
      }
      return produto.preco
    }
    const variacao = produto.precos?.find(p => p.tamanhoId === tamanhoSelecionado.id)
    return variacao ? variacao.preco : produto.preco
  }, [produto, tamanhoSelecionado])

  const totalSaboresExtra = saboresSelecionados.reduce((acc, sab) => acc + sab.precoAdicional, 0)
  const totalAdicionais = adicionaisSelecionados.reduce((acc, ad) => acc + ad.preco, 0)
  const precoUnitario = precoBase + totalSaboresExtra + totalAdicionais
  const precoTotal = precoUnitario * quantidade

  const handleToggleSabor = (sabor: Sabor) => {
    if (saboresSelecionados.find(s => s.id === sabor.id)) {
      setSaboresSelecionados(saboresSelecionados.filter(s => s.id !== sabor.id))
    } else {
      const limite = tamanhoSelecionado?.maxSabores || 1
      if (saboresSelecionados.length < limite) {
        setSaboresSelecionados([...saboresSelecionados, sabor])
      }
    }
  }

  const handleToggleAdicional = (adicional: Adicional) => {
    if (adicionaisSelecionados.find(a => a.id === adicional.id)) {
      setAdicionaisSelecionados(adicionaisSelecionados.filter(a => a.id !== adicional.id))
    } else {
      setAdicionaisSelecionados([...adicionaisSelecionados, adicional])
    }
  }

  const handleConfirmar = () => {
    const item: ItemCarrinho = {
      produto,
      quantidade,
      observacoes,
      tamanho: tamanhoSelecionado || undefined,
      sabores: saboresSelecionados,
      adicionais: adicionaisSelecionados,
      precoUnitario,
    }
    adicionarItem(item)
    onClose()
    setSaboresSelecionados([])
    setAdicionaisSelecionados([])
    setObservacoes('')
    setQuantidade(1)
  }

  // Scroll lock
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [aberto])

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
        >
          {/* Overlay */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          />

          {/* Sheet */}
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="
              relative w-full md:max-w-2xl md:mx-4
              bg-marca-fundo
              border-t md:border border-white/10
              rounded-t-[2.5rem] md:rounded-[2.5rem]
              shadow-2xl overflow-hidden flex flex-col
              /* mobile: ocupa até 92% da tela e não passa disso */
              max-h-[92dvh] md:max-h-[88vh]
            "
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* ── Header ───────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-marca-fundo sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-white uppercase tracking-tighter leading-none">
                    Personalizar
                  </h2>
                  <p className="text-[11px] text-orange-500 font-bold uppercase tracking-widest truncate mt-0.5">
                    {produto.nome}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white shrink-0"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Conteúdo Scrollável ─────────────────────── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-6">

              {/* Resumo do Produto */}
              <div className="flex gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-16 h-16 rounded-xl bg-black/20 p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-white truncate">{produto.nome}</h3>
                    {produto.emPromocao && produto.badgePromocao && (
                      <span className="text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase shrink-0">
                        {produto.badgePromocao}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {produto.descricao}
                  </p>
                  {/* Preço promocional no resumo */}
                  {produto.emPromocao && produto.precoPromocional && produto.precoPromocional > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-600 line-through font-mono">{formatarPreco(produto.preco)}</span>
                      <span className="text-[11px] font-black text-orange-400 font-mono">{formatarPreco(produto.precoPromocional)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tamanhos */}
              {produto.precos && produto.precos.length > 0 && (
                <div className="space-y-3">
                  <SectionLabel>Escolha o Tamanho</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {produto.precos.map((variacao) => {
                      if (!variacao.tamanho) return null
                      const ativo = tamanhoSelecionado?.id === variacao.tamanho.id
                      return (
                        <button
                          key={variacao.tamanho.id}
                          onClick={() => {
                            if (variacao.tamanho) setTamanhoSelecionado(variacao.tamanho)
                            setSaboresSelecionados([])
                          }}
                          className={`flex flex-col items-start p-2.5 rounded-xl border-2 transition-all duration-200
                            ${ativo
                              ? 'bg-orange-600/10 border-orange-600 text-white'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                        >
                          <span className="font-black text-base">{variacao.tamanho.nome}</span>
                          <span className={`text-xs mt-0.5 ${ativo ? 'text-orange-400' : 'text-gray-500'}`}>
                            {formatarPreco(variacao.preco)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Sabores (pizza) */}
              {produto.isPizza && saboresDisponiveis.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <SectionLabel>Escolha os Sabores</SectionLabel>
                    <span className="text-[10px] bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-md font-bold">
                      MÁX {tamanhoSelecionado?.maxSabores || 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {saboresDisponiveis.map((sabor) => {
                      const selecionado = !!saboresSelecionados.find(s => s.id === sabor.id)
                      const desabilitado = !selecionado && saboresSelecionados.length >= (tamanhoSelecionado?.maxSabores || 1)
                      return (
                        <button
                          key={sabor.id}
                          disabled={desabilitado}
                          onClick={() => handleToggleSabor(sabor)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200
                            ${selecionado
                              ? 'bg-orange-600 border-orange-600 text-white'
                              : desabilitado
                                ? 'bg-white/5 border-white/5 text-gray-700 opacity-50 cursor-not-allowed'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded-[6px] flex items-center justify-center border shrink-0
                              ${selecionado ? 'bg-white border-white text-orange-600' : 'bg-black/20 border-white/10 text-transparent'}`}>
                              <Check className="w-3 h-3" />
                            </div>
                            <div className="text-left min-w-0">
                              <span className="font-bold text-xs block truncate">{sabor.nome}</span>
                              {sabor.descricao && (
                                <span className="text-[9px] opacity-60 block truncate">{sabor.descricao}</span>
                              )}
                            </div>
                          </div>
                          {sabor.precoAdicional > 0 && (
                            <span className="text-xs font-black shrink-0 ml-2">+ {formatarPreco(sabor.precoAdicional)}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Adicionais */}
              {adicionaisDisponiveis.length > 0 && produto.categoria?.adicionaisHabilitados !== false && (
                <div className="space-y-3">
                  <SectionLabel>Adicionais / Extras</SectionLabel>
                  <div className="space-y-2">
                    {adicionaisDisponiveis.map((adicional) => {
                      const selecionado = !!adicionaisSelecionados.find(a => a.id === adicional.id)
                      return (
                        <button
                          key={adicional.id}
                          onClick={() => handleToggleAdicional(adicional)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200
                            ${selecionado
                              ? 'bg-orange-600/10 border-orange-600 text-white shadow-sm shadow-orange-500/10'
                              : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded-[6px] flex items-center justify-center border shrink-0
                              ${selecionado ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black/20 border-white/10 text-transparent'}`}>
                              <Check className="w-3 h-3" />
                            </div>
                            <span className="font-bold text-xs truncate">{adicional.nome}</span>
                          </div>
                          <span className={`text-[11px] font-black shrink-0 ml-2 ${selecionado ? 'text-orange-400' : 'text-gray-500'}`}>
                            + {formatarPreco(adicional.preco)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div className="space-y-3">
                <SectionLabel>Observações</SectionLabel>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Sem cebola, bem passado..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white
                             placeholder-gray-600 focus:border-orange-500/50 outline-none transition-all resize-none text-sm"
                />
              </div>

              {/* Espaço extra para o footer não sobrepor o conteúdo no iOS */}
              <div className="h-2" />
            </div>

            {/* ── Footer Fixo ─────────────────────────────── */}
            <div className="shrink-0 px-4 pt-3 pb-4 bg-black/60 border-t border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {/* Quantidade */}
                <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-2 py-1.5 border border-white/10 shrink-0">
                  <button
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-7 text-center font-black text-base text-white">{quantidade}</span>
                  <button
                    onClick={() => setQuantidade(quantidade + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Botão Adicionar */}
                <button
                  onClick={handleConfirmar}
                  disabled={produto.isPizza && saboresSelecionados.length === 0 && saboresDisponiveis.length > 0}
                  className="flex-1 bg-[#FF4D00] hover:bg-[#ff6520] active:scale-95 disabled:bg-gray-800 disabled:text-gray-500
                             text-black font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2
                             transition-all shadow-[0_8px_24px_-4px_rgba(255,77,0,0.4)]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  ADICIONAR • {formatarPreco(precoTotal)}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Helper ─────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
      {children}
    </label>
  )
}
