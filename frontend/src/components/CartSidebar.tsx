'use client'

import { useState, useEffect } from 'react'
import { X, Minus, Plus, ShoppingBag, Trash2, MessageSquare } from 'lucide-react'
import { useCarrinhoStore } from '@/store/cartStore'
import { formatarPreco } from '@/lib/utils'
import { isStoreOpen } from '@/lib/storeStatus'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTenant } from './TenantProvider'

export default function CartSidebar() {
  const empresa = useTenant()
  const {
    itens,
    aberto,
    fecharCarrinho,
    removerItem,
    alterarQuantidade,
    total,
    limparCarrinho,
  } = useCarrinhoStore()

  const [lojaAberta, setLojaAberta] = useState(true)

  useEffect(() => {
    setLojaAberta(isStoreOpen(
      empresa.horarioAbertura ?? undefined, 
      empresa.horarioFechamento ?? undefined,
      empresa.diasAbertos ?? undefined // Agora passa os dias também!
    ))
  }, [empresa])


  // Senior Fix: Body Scroll Lock para evitar que o fundo role com o carrinho aberto
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
          key="cart-sidebar-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex justify-end"
        >
          {/* Overlay - Captura o clique para fechar e limpa o backdrop */}
          <div
            onClick={fecharCarrinho}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Sidebar - Conteúdo Real */}
          <motion.div
            key="cart-sidebar-content"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-full w-[75%] max-w-md bg-black 
                       border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header do carrinho */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-orange-500 shrink-0" />
                <h2 className="text-sm md:text-lg font-display font-bold truncate">Seu Pedido</h2>
                <span className="bg-orange-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  {itens.length}
                </span>
              </div>
              <button
                onClick={fecharCarrinho}
                className="p-1.5 md:p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
                aria-label="Fechar carrinho"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de itens */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
              {itens.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-700" />
                  </div>
                  <p className="text-white text-xl font-black uppercase tracking-tighter mb-2">
                    Carrinho vazio
                  </p>
                  <p className="text-gray-500 text-sm max-w-[200px]">
                    Sua sacola está esperando para ser preenchida com delícias.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {itens.map((item, index) => (
                    <motion.div
                      key={`${item.produto.id}-${item.tamanho?.id ?? 'sem-tamanho'}-${JSON.stringify(item.adicionais ?? [])}-${item.observacoes}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="relative group"
                    >
                      <div className="flex gap-4">
                        {/* Imagem */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 p-1 flex items-center justify-center flex-shrink-0 border border-white/5">
                          <img
                            src={item.produto.imagem}
                            alt={item.produto.nome}
                            loading="lazy"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-black text-white uppercase tracking-tighter truncate pr-2">
                              {item.produto.nome}
                            </h3>
                            <button
                              onClick={() => removerItem(index)}
                              className="text-gray-600 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Detalhes (Tamanho e Sabores) */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tamanho && (
                              <span className="text-[10px] font-black bg-orange-600/10 text-orange-500 px-2 py-0.5 rounded border border-orange-600/20 uppercase">
                                {item.tamanho.nome}
                              </span>
                            )}
                            {item.sabores?.map(sabor => (
                              <span key={sabor.id} className="text-[10px] font-bold bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5 uppercase">
                                {sabor.nome}
                              </span>
                            ))}
                          </div>

                          {/* Adicionais */}
                          {item.adicionais && item.adicionais.length > 0 && (
                            <p className="text-[10px] text-gray-500 mt-1 italic">
                              + {item.adicionais.map(a => a.nome).join(', ')}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-orange-500 font-display font-black text-sm">
                              {formatarPreco(item.precoUnitario * item.quantidade)}
                            </span>

                            <div className="flex items-center gap-3 bg-black/20 p-1 rounded-xl border border-white/5">
                              <button
                                onClick={() => alterarQuantidade(index, item.quantidade - 1)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5 text-gray-500 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-white w-4 text-center">
                                {item.quantidade}
                              </span>
                              <button
                                onClick={() => alterarQuantidade(index, item.quantidade + 1)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5 text-gray-500 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Observações */}
                          {item.observacoes && (
                            <div className="mt-2 text-[10px] text-gray-500 flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                              <span className="line-clamp-1 italic">{item.observacoes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer com total */}
            {itens.length > 0 && (
              <div className="border-t border-white/10 p-4 md:p-6 space-y-3 md:space-y-4 bg-black/40 backdrop-blur-xl shrink-0">
                {/* Limpar carrinho */}
                <button
                  onClick={limparCarrinho}
                  className="text-[10px] md:text-xs text-gray-500 hover:text-orange-400 transition-colors"
                >
                  Limpar carrinho
                </button>

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-gray-400 font-medium">Total</span>
                  <span className="text-xl md:text-2xl font-display font-bold text-gradient">
                    {formatarPreco(total())}
                  </span>
                </div>

                {/* Botão finalizar */}
                {lojaAberta ? (
                  <Link
                    href={`/${empresa.slug}/checkout`}
                    onClick={fecharCarrinho}
                    className="btn-primary w-full flex items-center justify-center gap-3 text-center py-4 md:py-6 text-sm md:text-lg font-black tracking-widest active:scale-95"
                  >
                    FINALIZAR PEDIDO
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 text-center py-3 md:py-4 text-sm md:text-base bg-red-600/20 text-red-500 font-bold rounded-2xl cursor-not-allowed border border-red-500/20"
                  >
                    LOJA FECHADA
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
