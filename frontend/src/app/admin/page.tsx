'use client'

import React, { useMemo, memo, useState, useEffect } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { formatarPreco } from '@/lib/utils'
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Package,
  ArrowUpRight,
  Lock,
  ArrowRight,
  RefreshCw,
  Flame,
  ChefHat,
  Bike,
  CircleCheck,
  CircleX,
} from 'lucide-react'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import useSWR from 'swr'
import { DashboardSkeleton } from '@/components/admin/AdminSkeletons'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Mapa de Status ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pendente:    { label: 'Pendente',    color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: Clock },
  confirmado:  { label: 'Confirmado',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   icon: CheckCircle2 },
  preparando:  { label: 'Preparando',  color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: ChefHat },
  'em entrega':{ label: 'Em Entrega',  color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: Bike },
  entregue:    { label: 'Entregue',    color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  icon: CircleCheck },
  cancelado:   { label: 'Cancelado',   color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    icon: CircleX },
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
    icon: AlertCircle,
  }
}

// ─── Timer de reset diário ─────────────────────────────────────────────────────

function useDailyResetTimer() {
  const [tempo, setTempo] = useState('')
  useEffect(() => {
    const calcular = () => {
      const agora = new Date()
      const meianoite = new Date()
      meianoite.setHours(24, 0, 0, 0)
      const diff = meianoite.getTime() - agora.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTempo(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    calcular()
    const id = setInterval(calcular, 1000)
    return () => clearInterval(id)
  }, [])
  return tempo
}

// ─── Relógio ao vivo ───────────────────────────────────────────────────────────

function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = memo(({ stat }: { stat: any }) => (
  <div className="glass-card p-4 md:p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
    <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
      <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color}`}>
        <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <ChevronRight className="w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-all" />
    </div>
    <div className="relative z-10">
      <h3 className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</h3>
      <p className="text-xl md:text-3xl font-display font-black text-white mt-1">{stat.valor}</p>
      <p className="text-[8px] md:text-[9px] text-gray-600 font-bold uppercase tracking-tighter mt-2">{stat.sub}</p>
    </div>
    <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] transition-all group-hover:scale-110 duration-700 ${stat.color}`} />
  </div>
))
StatCard.displayName = 'StatCard'

const StatCardDiario = memo(({ stat }: { stat: any }) => {
  const timer = useDailyResetTimer()
  return (
    <div className="glass-card p-4 md:p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
        <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color}`}>
          <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl">
          <Clock className="w-3 h-3 text-gray-600" />
          <span className="text-[9px] font-black text-gray-500 tabular-nums tracking-widest">{timer}</span>
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</h3>
        <p className="text-xl md:text-3xl font-display font-black text-white mt-1">{stat.valor}</p>
        <p className="text-[8px] md:text-[9px] text-gray-600 font-bold uppercase tracking-tighter mt-2">
          Reinicia em <span className="text-orange-500/70">{timer}</span>
        </p>
      </div>
      <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] transition-all group-hover:scale-110 duration-700 ${stat.color}`} />
    </div>
  )
})
StatCardDiario.displayName = 'StatCardDiario'

// ─── Painel de Pedidos em Tempo Real ──────────────────────────────────────────

const PainelPedidosTempoReal = memo(({ pedidos }: { pedidos: any[] }) => {
  const clock = useClock()
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [pulse, setPulse] = useState(false)

  // Conta por status
  const contagem = useMemo(() => {
    const map: Record<string, number> = {}
    pedidos.forEach(p => {
      const s = (p.status || 'pendente').toLowerCase()
      map[s] = (map[s] || 0) + 1
    })
    return map
  }, [pedidos])

  // Pulsa quando chegam novos pedidos
  useEffect(() => {
    setPulse(true)
    setLastUpdate(new Date())
    const t = setTimeout(() => setPulse(false), 800)
    return () => clearTimeout(t)
  }, [pedidos.length])

  const statusOrder = ['pendente', 'confirmado', 'preparando', 'em entrega', 'entregue', 'cancelado']
  const ativos = pedidos.filter(p => !['entregue', 'cancelado'].includes((p.status || '').toLowerCase()))

  return (
    <div className={`w-full bg-[#080808] border rounded-[2rem] overflow-hidden transition-all duration-500 ${
      pulse ? 'border-orange-500/40 shadow-[0_0_30px_rgba(234,88,12,0.08)]' : 'border-white/[0.04]'
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-8 py-5 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${ativos.length > 0 ? 'bg-orange-500' : 'bg-green-500'} `} />
            {ativos.length > 0 && (
              <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-60" />
            )}
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-white uppercase tracking-tighter leading-none">
              Pedidos em Tempo Real
            </h2>
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
              {ativos.length > 0 ? `${ativos.length} pedido${ativos.length > 1 ? 's' : ''} ativo${ativos.length > 1 ? 's' : ''}` : 'Tudo tranquilo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Relógio */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-black font-mono tabular-nums text-white/70">{clock}</span>
          </div>
          {/* Link pedidos */}
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-2 text-[10px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest transition-colors group"
          >
            Ver todos
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Chips de status */}
      <div className="flex gap-2 px-5 md:px-8 py-3 overflow-x-auto scrollbar-hide border-b border-white/[0.03]">
        {statusOrder.map(s => {
          const count = contagem[s] || 0
          if (count === 0) return null
          const cfg = getStatusConfig(s)
          return (
            <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.border} shrink-0`}>
              <cfg.icon className={`w-3 h-3 ${cfg.color}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
              <span className={`text-[9px] font-black ${cfg.color} ml-0.5`}>{count}</span>
            </div>
          )
        })}
        {pedidos.length === 0 && (
          <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest py-1.5">Aguardando pedidos...</span>
        )}
      </div>

      {/* Lista de pedidos */}
      <div className="divide-y divide-white/[0.03]">
        <AnimatePresence initial={false}>
          {pedidos.length > 0 ? (
            pedidos.slice(0, 10).map((pedido, i) => {
              const cfg = getStatusConfig(pedido.status)
              const Icon = cfg.icon
              return (
                <motion.div
                  key={pedido.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 md:px-8 py-4 hover:bg-white/[0.015] transition-colors group"
                >
                  {/* Ícone status */}
                  <div className={`w-9 h-9 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white text-sm uppercase tracking-tight truncate">
                        {pedido.nomeCliente}
                      </p>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.border} ${cfg.color} shrink-0`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 font-medium mt-0.5 truncate">
                      {pedido.bairro || 'Bairro não informado'} • {new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="text-right shrink-0">
                    <p className="font-display font-black text-orange-500 text-sm tabular-nums">
                      {formatarPreco(pedido.totalFinal || pedido.total || 0)}
                    </p>
                    <p className="text-[9px] text-gray-700 font-bold mt-0.5 uppercase">
                      {pedido.formaPagamento}
                    </p>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center relative">
                <ShoppingBag className="w-8 h-8 text-gray-700" />
                <div className="absolute inset-0 rounded-full bg-orange-500/5 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-white font-black uppercase tracking-widest text-xs">Nenhum pedido ainda</p>
                <p className="text-gray-600 text-[10px] font-medium mt-1">Os pedidos aparecerão aqui em tempo real</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 md:px-8 py-3 border-t border-white/[0.03] bg-white/[0.005]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3 h-3 text-green-500" />
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Atualiza a cada 8s</span>
        </div>
        <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
          {pedidos.length} registro{pedidos.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
})
PainelPedidosTempoReal.displayName = 'PainelPedidosTempoReal'

// ─── Tela de Login ─────────────────────────────────────────────────────────────

function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 md:p-12 border border-white/5 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl group-hover:bg-orange-600/20 transition-all duration-1000" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-orange-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-600/20">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter italic mb-4">
            Painel <span className="text-orange-500">Restrito</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
            Identifique-se para acessar as ferramentas de gestão do restaurante.
          </p>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-white text-black h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 hover:bg-orange-500 hover:text-white transition-all group active:scale-95 shadow-2xl"
          >
            <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />
            Entrar com Google
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
          </button>
          <p className="mt-8 text-[9px] text-gray-700 font-bold uppercase tracking-[0.3em]">
            Proteção Biométrica & Criptografia Ponta-a-Ponta
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Principal ───────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const pedidos = useAdminStore(state => state.pedidos)
  const produtos = useAdminStore(state => state.produtos)
  const carregarDados = useAdminStore(state => state.carregarDados)

  const { data: metrics, isLoading: loadingMetrics } = useSWR(
    status === 'authenticated' ? '/api/admin/metrics' : null,
    async (url) => { const res = await fetch(url); return res.json() },
    { refreshInterval: 8000 }
  )

  // Recarrega pedidos a cada 8 segundos
  useSWR(
    status === 'authenticated' ? 'admin-data-dash' : null,
    () => carregarDados(),
    { refreshInterval: 8000, revalidateOnFocus: true }
  )

  const isLoading = status === 'loading' || (status === 'authenticated' && loadingMetrics)

  // @ts-ignore
  const userRole = session?.user?.role
  const isBoss = userRole === 'BOSS'

  const stats = useMemo(() => {
    const safeProdutos = Array.isArray(produtos) ? produtos : []
    const baseStats = [
      { label: 'Receita Hoje', valor: formatarPreco(metrics?.receitaTotal || 0), sub: 'Receita do dia', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', diario: true },
      { label: 'Pedidos Hoje', valor: metrics?.pedidosHoje || 0, sub: 'Volume do dia', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10', diario: true },
      { label: 'Cozinha Ativa', valor: metrics?.cozinhaAtiva || 0, sub: 'Aguardando Preparo', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { label: 'Itens de Menu', valor: safeProdutos.length, sub: 'Produtos Ativos', icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]
    return isBoss ? baseStats : baseStats.filter(s => s.label !== 'Receita Hoje')
  }, [metrics, produtos, isBoss])

  if (status === 'unauthenticated') return <LoginPage />
  if (isLoading) return <DashboardSkeleton />

  if (userRole === 'STAFF') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-white font-black uppercase tracking-widest text-xs animate-pulse">Acessando Central de Pedidos...</p>
        <Link href="/admin/pedidos" className="text-orange-500 font-bold uppercase text-[10px] tracking-widest border border-orange-500/20 px-6 py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
          Clique aqui se não for redirecionado
        </Link>
      </div>
    )
  }

  const safePedidos = Array.isArray(pedidos) ? pedidos : []

  return (
    <div className="space-y-6 md:space-y-8 pb-20 antialiased">

      {/* Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-4xl font-display font-black text-white tracking-tighter uppercase italic">
            Dashboard <span className="text-orange-500">M.E</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Monitoramento em Tempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-6 py-4 rounded-3xl backdrop-blur-md">
          <div className="w-10 h-10 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sincronização</p>
            <p className="text-xs font-black text-white uppercase italic">SISTEMA ATIVO</p>
          </div>
        </div>
      </div>

      {/* Stats rápidos — Cozinha + Menu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.slice(0, 2).map((stat) => (
          <StatCardDiario key={stat.label} stat={stat} />
        ))}
        {stats.slice(2).map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* ─── Painel principal: Pedidos em tempo real ─── */}
      <PainelPedidosTempoReal pedidos={safePedidos} />

     
    </div>
  )
}
