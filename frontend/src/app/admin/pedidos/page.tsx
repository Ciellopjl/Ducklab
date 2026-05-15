'use client'

import React, { useState, useMemo, useCallback, memo } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { formatarPreco, formatarTelefone } from '@/lib/utils'
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  Eye, 
  XCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  Trash2, 
  MessageCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { CardSkeleton } from '@/components/admin/AdminSkeletons'
import { shallow } from 'zustand/shallow'

// --- Componentes Memoizados ---

const StatusBadge = memo(({ status }: { status: string }) => {
  const statusMap = {
    pendente: { label: 'Pendente', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    preparando: { label: 'Preparando', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    entregando: { label: 'Em Entrega', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    entregue: { label: 'Entregue', color: 'text-green-500', bg: 'bg-green-500/10' },
    cancelado: { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-500/10' },
  }
  const config = (statusMap as any)[status] || statusMap.pendente
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  )
})

StatusBadge.displayName = 'StatusBadge'

const PedidoCard = memo(({ pedido, onDetail, onUpdateStatus }: { pedido: any, onDetail: (p: any) => void, onUpdateStatus: (id: string, s: string) => void }) => {
  const getWhatsAppNotificacaoUrl = (pedido: any, tipo: string) => {
    const telefone = pedido.telefone.replace(/\D/g, '')
    let mensagem = ''
    if (tipo === 'preparando') mensagem = `Olá ${pedido.nomeCliente}! O seu pedido #${pedido.id.slice(0, 4)} já está sendo preparado. 👨‍🍳🍔`
    else if (tipo === 'entregando') mensagem = `Boas notícias, ${pedido.nomeCliente}! 🛵 Seu pedido #${pedido.id.slice(0, 4)} saiu para entrega!`
    else if (tipo === 'entregue') mensagem = `Obrigado, ${pedido.nomeCliente}! 😋❤️ Seu pedido #${pedido.id.slice(0, 4)} foi entregue. Esperamos que goste!`
    return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
  }

  return (
    <div
      className="glass-card p-5 md:p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black font-mono text-gray-700 bg-white/5 px-2 py-0.5 rounded">#{pedido.id.slice(0, 6).toUpperCase()}</span>
            <StatusBadge status={pedido.status} />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter truncate max-w-[250px]">{pedido.nomeCliente}</h3>
            <span className="text-sm font-display font-black text-orange-500">{formatarPreco(pedido.total)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-[11px] text-gray-500 font-medium uppercase tracking-tighter">
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-700" /> {formatarTelefone(pedido.telefone)}</div>
            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-700" /> {pedido.bairro}</div>
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-700" /> {new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="flex items-center gap-2 font-black text-gray-400 italic">Pagamento: {pedido.formaPagamento}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
          <button 
            onClick={() => onDetail(pedido)}
            className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all active:scale-90 shadow-inner"
          >
            <Eye className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:flex-none flex items-center gap-2">
            {pedido.status === 'pendente' && (
              <button 
                onClick={() => onUpdateStatus(pedido.id, 'preparando')}
                className="btn-primary flex-1 lg:flex-none !py-3.5 !px-6 text-xs"
              >
                INICIAR PREPARO
              </button>
            )}
            
            {pedido.status === 'preparando' && (
              <>
                <a href={getWhatsAppNotificacaoUrl(pedido, 'preparando')} target="_blank" className="p-3.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-2xl transition-all shadow-lg shadow-green-600/10">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => onUpdateStatus(pedido.id, 'entregando')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] py-3.5 px-6 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex-1 lg:flex-none"
                >
                  SAIU P/ ENTREGA
                </button>
              </>
            )}

            {pedido.status === 'entregando' && (
              <>
                <a href={getWhatsAppNotificacaoUrl(pedido, 'entregando')} target="_blank" className="p-3.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-2xl transition-all shadow-lg shadow-green-600/10">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => onUpdateStatus(pedido.id, 'entregue')}
                  className="bg-green-600 hover:bg-green-500 text-white font-black text-[10px] py-3.5 px-6 rounded-2xl shadow-xl shadow-green-600/20 transition-all flex-1 lg:flex-none"
                >
                  CONFIRMAR ENTREGA
                </button>
              </>
            )}

            {pedido.status === 'entregue' && (
               <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-4">Pedido Concluído</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

PedidoCard.displayName = 'PedidoCard'

// --- Componente Principal ---

export default function PedidosAdmin() {
  const pedidos = useAdminStore(state => state.pedidos)
  const atualizarStatusPedido = useAdminStore(state => state.atualizarStatusPedido)
  const carregarPedidos = useAdminStore(state => state.carregarPedidos)
  const isLoading = useAdminStore(state => state.loadingStates['pedidos']
  )
  
  useSWR('admin-pedidos-list-optimized', () => carregarPedidos(), { 
    refreshInterval: 10000,
    revalidateOnFocus: false
  })
  
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')

  const pedidosFiltrados = useMemo(() => {
    if (!Array.isArray(pedidos)) return []
    return pedidos.filter(p => {
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus
      const matchBusca = p.nomeCliente.toLowerCase().includes(busca.toLowerCase()) || 
                         p.id.includes(busca)
      return matchStatus && matchBusca
    })
  }, [pedidos, filtroStatus, busca])

  const handleUpdate = useCallback(async (id: string, novoStatus: string) => {
    try {
      await atualizarStatusPedido(id, novoStatus)
      toast.success('Status atualizado!')
    } catch (err) {
      toast.error('Erro ao atualizar')
    }
  }, [atualizarStatusPedido])

  if (isLoading && (!pedidos || pedidos.length === 0)) {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <div className="w-48 h-8 bg-white/10 rounded-xl animate-pulse" />
          <div className="w-40 h-14 bg-white/5 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
          <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
          <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
             <div className="p-3 bg-orange-600/10 rounded-2xl border border-orange-600/20 text-orange-500">
               <Clock className="w-6 h-6 md:w-8 md:h-8" />
             </div>
             Central de Pedidos
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Acompanhamento em Tempo Real</p>
        </div>

        <button
          onClick={async () => {
            if (confirm('Deseja limpar a central? Os pedidos serão arquivados, mas o histórico de faturamento será mantido.')) {
              try {
                await useAdminStore.getState().limparPedidos()
                toast.success('Central limpa!')
              } catch (err) {
                toast.error('Erro ao limpar')
              }
            }
          }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner group"
        >
          <Trash2 className="w-4 h-4 text-orange-500/50 group-hover:text-orange-500 transition-colors" />
          Limpar Central
        </button>
      </div>

      {/* Filtros e Busca Otimizados */}
      <div className="glass-card p-4 md:p-6 border border-white/5 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-orange-500 transition-colors" />
           <input 
              type="text"
              placeholder="Buscar por cliente ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:text-gray-800"
           />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['todos', 'pendente', 'preparando', 'entregando', 'entregue'].map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                filtroStatus === s
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xl shadow-orange-600/20'
                  : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Listagem de Pedidos */}
      <div className="grid grid-cols-1 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <PedidoCard 
            key={pedido.id} 
            pedido={pedido} 
            onDetail={setPedidoSelecionado} 
            onUpdateStatus={handleUpdate} 
          />
        ))}

        {pedidosFiltrados.length === 0 && (
          <div className="py-24 text-center glass-card border-dashed border-2 border-white/5">
             <Clock className="w-16 h-16 text-gray-800 mx-auto mb-4 opacity-50" />
             <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Nenhum pedido nesta categoria</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido - Premium */}
      <AnimatePresence>
        {pedidoSelecionado && (
          <div className="fixed inset-0 z-[600] flex items-end md:items-center justify-center md:p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPedidoSelecionado(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              className="relative bg-marca-preto border border-white/10 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500">
                      <Eye className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-xl font-black text-white uppercase tracking-tighter">Detalhes da Ordem</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Pedido #{pedidoSelecionado.id.slice(0, 8).toUpperCase()}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setPedidoSelecionado(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Info Cliente */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Destinatário</h4>
                       <div className="space-y-3">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Nome</p>
                             <p className="text-white font-bold">{pedidoSelecionado.nomeCliente}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Localização</p>
                             <p className="text-white font-bold text-sm leading-relaxed">{pedidoSelecionado.endereco}, {pedidoSelecionado.bairro}</p>
                          </div>
                          <a
                             href={`https://wa.me/55${pedidoSelecionado.telefone.replace(/\D/g, '')}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center justify-between p-4 bg-green-600/10 hover:bg-green-600/20 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all group"
                          >
                             <div>
                                <p className="text-[9px] text-green-500 font-black uppercase mb-1">Telefone</p>
                                <p className="text-white font-bold text-sm">{formatarTelefone(pedidoSelecionado.telefone)}</p>
                             </div>
                             <div className="p-2.5 bg-green-600/20 group-hover:bg-green-600 rounded-xl text-green-500 group-hover:text-white transition-all">
                                <Phone className="w-4 h-4" />
                             </div>
                          </a>
                       </div>
                    </div>

                    {/* Info Pagamento */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Transação</h4>
                       <div className="space-y-3">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Método</p>
                             <p className="text-white font-black uppercase tracking-widest">{pedidoSelecionado.formaPagamento}</p>
                          </div>
                          <div className="p-6 bg-orange-600/5 rounded-2xl border border-orange-600/20">
                             <p className="text-[9px] text-orange-500 font-black uppercase mb-1">Valor Final</p>
                             <p className="text-3xl font-display font-black text-white">{formatarPreco(pedidoSelecionado.total)}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Produtos */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Itens Selecionados</h4>
                    <div className="space-y-2">
                       {JSON.parse(pedidoSelecionado.itens).map((item: any, i: number) => (
                         <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center font-black text-sm">{item.quantidade}x</div>
                               <div>
                                  <p className="text-white font-bold uppercase text-sm tracking-tight">{item.nome}</p>
                                  {item.tamanho && <p className="text-[9px] text-orange-500 font-black uppercase tracking-tighter mt-0.5">Tam: {item.tamanho.nome}</p>}
                               </div>
                            </div>
                            <span className="text-sm font-black text-gray-500">{formatarPreco(item.preco * item.quantidade)}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {pedidoSelecionado.observacoes && (
                    <div className="p-6 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3">
                          <MessageCircle className="w-4 h-4 text-orange-500/30" />
                       </div>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Anotações do Cliente</p>
                       <p className="text-white text-sm leading-relaxed italic">{`"`}{pedidoSelecionado.observacoes}{`"`}</p>
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
