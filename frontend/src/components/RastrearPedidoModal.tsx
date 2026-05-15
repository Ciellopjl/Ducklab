'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Search, Package, ChefHat, Bike, CheckCircle2,
  Clock, MapPin, CreditCard, ReceiptText, Loader2,
} from 'lucide-react'
import { useTenant } from './TenantProvider'
import { formatarPreco } from '@/lib/utils'

/* ─── Types ─────────────────────────────────────────────── */
interface ItemPedido {
  nome: string
  quantidade: number
  precoUnitario?: number
  preco?: number
  tamanho?: { nome: string }
  sabores?: { nome: string }[]
  adicionais?: { nome: string }[]
  observacoes?: string
}

interface PedidoRastreado {
  id: string
  serial: string | null
  nomeCliente: string
  status: string
  itens: ItemPedido[]
  total: number
  totalFinal: number
  desconto: number
  formaPagamento: string
  criadoEm: string
  endereco: string
  bairro: string
}

/* ─── Status config ─────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; Icon: React.ElementType; pulse: boolean }
> = {
  pendente: {
    label: 'Pendente',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    Icon: Clock,
    pulse: false,
  },
  preparando: {
    label: 'Preparando',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    Icon: ChefHat,
    pulse: true,
  },
  entregando: {
    label: 'Saiu p/ Entrega',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    Icon: Bike,
    pulse: true,
  },
  entregue: {
    label: 'Entregue',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    Icon: CheckCircle2,
    pulse: false,
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    Icon: X,
    pulse: false,
  },
}

const STATUS_STEPS = ['pendente', 'preparando', 'entregando', 'entregue']

/* ─── Props ─────────────────────────────────────────────── */
interface Props {
  onClose: () => void
}

/* ─── Component ─────────────────────────────────────────── */
export default function RastrearPedidoModal({ onClose }: Props) {
  const empresa = useTenant()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [pedido, setPedido] = useState<PedidoRastreado | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  async function buscarPedido() {
    const valor = query.trim()
    if (!valor) return
    setLoading(true)
    setPedido(null)
    setErro(null)

    try {
      const res = await fetch(
        `/api/pedidos/rastrear?q=${encodeURIComponent(valor)}&empresaSlug=${empresa.slug}`
      )
      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro ?? 'Não foi possível encontrar o pedido.')
        return
      }
      setPedido(data as PedidoRastreado)
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const statusCfg =
    pedido ? (STATUS_CONFIG[pedido.status.toLowerCase()] ?? STATUS_CONFIG['pendente']) : null

  const stepIndex = pedido
    ? STATUS_STEPS.indexOf(pedido.status.toLowerCase())
    : -1

  const dataFormatada = pedido
    ? new Date(pedido.criadoEm).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    // Se só tem números e caracteres de máscara, tenta aplicar a máscara de telefone
    const isPhoneLike = /^[\d\s()-]+$/.test(val)
    
    if (isPhoneLike) {
      const digits = val.replace(/\D/g, '')
      if (digits.length > 5) {
        if (digits.length <= 10) {
          val = digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '')
        } else {
          val = digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '')
        }
      } else if (digits.length > 2) {
        val = digits.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
      }
    }
    setQuery(val)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="rastrear-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
      />

      {/* Wrapper to center modal safely */}
      <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
        {/* Modal */}
        <motion.div
          key="rastrear-modal"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full md:w-[520px] max-h-[85vh] md:max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF4D00]/10 border border-[#FF4D00]/20">
              <Package className="w-4 h-4 text-[#FF4D00]" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Meus Pedidos
              </h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Busque pelo número ou telefone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-5 scrollbar-hide">
          {/* Search input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && buscarPedido()}
                placeholder="Número (#0005) ou telefone"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3
                           text-sm text-white placeholder:text-gray-600
                           focus:outline-none focus:border-[#FF4D00]/50 focus:ring-1 focus:ring-[#FF4D00]/30
                           transition-all"
              />
            </div>
            <button
              onClick={buscarPedido}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF4D00] text-black font-black text-sm
                         hover:bg-[#ff6520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {erro && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                {erro}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {pedido && statusCfg && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Status hero card */}
                <div className={`p-4 rounded-2xl border ${statusCfg.bg} ${statusCfg.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 font-medium">
                      Pedido #{pedido.serial ?? pedido.id.slice(0, 6)}
                    </span>
                    <span className="text-xs text-gray-500">{dataFormatada}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${statusCfg.bg} border ${statusCfg.border}`}>
                      <statusCfg.Icon
                        className={`w-5 h-5 ${statusCfg.color} ${statusCfg.pulse ? 'animate-pulse' : ''}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status atual</p>
                      <p className={`text-base font-black uppercase tracking-tight ${statusCfg.color}`}>
                        {statusCfg.label}
                      </p>
                    </div>
                  </div>

                  {/* Progress stepper (only for non-cancelled) */}
                  {pedido.status.toLowerCase() !== 'cancelado' && (
                    <div className="flex items-center gap-0 mt-4">
                      {STATUS_STEPS.map((step, i) => {
                        const done = i <= stepIndex
                        const active = i === stepIndex
                        const cfg = STATUS_CONFIG[step]
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500
                                ${done
                                  ? `${active ? cfg.bg : 'bg-[#FF4D00]/20'} border-[#FF4D00]`
                                  : 'bg-white/5 border-white/10'
                                }`}
                            >
                              <cfg.Icon
                                className={`w-3.5 h-3.5 ${done ? 'text-[#FF4D00]' : 'text-gray-600'}`}
                              />
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 mx-1 transition-all duration-500
                                  ${i < stepIndex ? 'bg-[#FF4D00]' : 'bg-white/10'}`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Cliente e entrega */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
                    <p className="text-sm font-bold text-white truncate">{pedido.nomeCliente}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1 mb-1">
                      <CreditCard className="w-3 h-3 text-gray-500" />
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pagamento</p>
                    </div>
                    <p className="text-sm font-bold text-white capitalize truncate">
                      {pedido.formaPagamento}
                    </p>
                  </div>
                </div>

                {/* Endereço */}
                {pedido.endereco && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <MapPin className="w-4 h-4 text-[#FF4D00] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">
                      {pedido.endereco}
                      {pedido.bairro ? ` — ${pedido.bairro}` : ''}
                    </p>
                  </div>
                )}

                {/* Itens */}
                <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <ReceiptText className="w-4 h-4 text-[#FF4D00]" />
                    <p className="text-xs font-black uppercase tracking-wider text-white">Itens do Pedido</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {pedido.itens.map((item, i) => (
                      <div key={i} className="px-4 py-3 flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {item.quantidade}× {item.nome}
                          </p>
                          {item.tamanho && (
                            <p className="text-[10px] text-orange-400 uppercase font-bold mt-0.5">
                              {item.tamanho.nome}
                            </p>
                          )}
                          {item.sabores && item.sabores.length > 0 && (
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {item.sabores.map((s) => s.nome).join(', ')}
                            </p>
                          )}
                          {item.adicionais && item.adicionais.length > 0 && (
                            <p className="text-[10px] text-gray-600 mt-0.5 italic">
                              + {item.adicionais.map((a) => a.nome).join(', ')}
                            </p>
                          )}
                          {item.observacoes && (
                            <p className="text-[10px] text-gray-600 mt-0.5 italic">
                              Obs: {item.observacoes}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#FF4D00] shrink-0">
                          {formatarPreco((item.precoUnitario ?? item.preco ?? 0) * item.quantidade)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="p-4 rounded-2xl bg-black border border-[#FF4D00]/20">
                  {pedido.desconto > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-gray-400">{formatarPreco(pedido.total)}</span>
                    </div>
                  )}
                  {pedido.desconto > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-400">Desconto</span>
                      <span className="text-green-400">- {formatarPreco(pedido.desconto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-xl font-black text-[#FF4D00]">
                      {formatarPreco(pedido.totalFinal)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!loading && !pedido && !erro && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Package className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 max-w-[220px]">
                Digite o número do pedido (ex: <span className="text-white font-bold">#0005</span>) ou
                seu telefone para rastrear.
              </p>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  )
}
