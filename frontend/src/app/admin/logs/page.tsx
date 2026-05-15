'use client'

import { useState, useEffect } from 'react'
import {
  History,
  Search,
  User,
  Activity,
  Clock,
  Calendar as CalendarIcon,
  Filter,
  ArrowRight,
  Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'

interface Log {
  id: string
  usuarioEmail: string
  acao: string
  detalhes: string
  ip?: string
  criadoEm: string
}

const ACTION_COLORS: Record<string, string> = {
  'LOGIN': 'text-blue-500 bg-blue-500/10',
  'LOGOUT': 'text-gray-500 bg-gray-500/10',
  'PRODUTO_CRIADO': 'text-green-500 bg-green-500/10',
  'PRODUTO_EDITADO': 'text-yellow-500 bg-yellow-500/10',
  'PRODUTO_DELETADO': 'text-orange-500 bg-orange-500/10',
  'CATEGORIA_CRIADA': 'text-green-400 bg-green-400/10',
  'CUPOM_CRIADO': 'text-purple-500 bg-purple-500/10',
  'ACESSO_AUTORIZADO': 'text-cyan-500 bg-cyan-500/10',
}

export default function LogsPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [filtroEmail, setFiltroEmail] = useState('')

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs')
      const data = await res.json()
      if (Array.isArray(data)) setLogs(data)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleClearLogs = async () => {
    if (!confirm('Tem certeza que deseja apagar TODO o histórico de atividades? Esta ação não pode ser desfeita.')) return
    
    setClearing(true)
    try {
      const res = await fetch('/api/logs', { method: 'DELETE' })
      if (res.ok) {
        toast.success('Histórico limpo com sucesso!')
        setLogs([])
      } else {
        toast.error('Erro ao limpar histórico.')
      }
    } catch (error) {
      toast.error('Erro de conexão.')
    } finally {
      setClearing(false)
    }
  }

  const filteredLogs = logs
    .filter(log => log.usuarioEmail !== 'ciellolisboa023@gmail.com') // Ocultar dono principal
    .filter(log =>
      log.usuarioEmail.toLowerCase().includes(filtroEmail.toLowerCase()) ||
      log.detalhes.toLowerCase().includes(filtroEmail.toLowerCase()) ||
      log.acao.toLowerCase().includes(filtroEmail.toLowerCase())
    )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between flex-1">
          <div>
            <h1 className="text-xl md:text-3xl font-display font-black text-white flex items-center gap-2 md:gap-3">
              <History className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
              Logs de Atividade
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Histórico completo de tudo que acontece no seu painel administrativo</p>
          </div>
          
          <button
            onClick={handleClearLogs}
            disabled={clearing || logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:grayscale"
          >
            <Trash2 className="w-4 h-4" />
            {clearing ? 'Limpando...' : 'Limpar Histórico'}
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Filtrar por usuário ou ação..."
            value={filtroEmail}
            onChange={(e) => setFiltroEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600 transition-all w-full md:w-80"
          />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="glass-card overflow-hidden border border-white/5">
        <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Linha do Tempo</span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredLogs.map((log, i) => {
            const date = new Date(log.criadoEm)
            const colorClass = ACTION_COLORS[log.acao] || 'text-gray-400 bg-white/5'

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-6 hover:bg-white/[0.02] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${colorClass} shrink-0`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-orange-500">
                        {log.usuarioEmail.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">
                        ({log.usuarioEmail})
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{log.detalhes}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <Clock className="w-3 h-3" />
                        {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <CalendarIcon className="w-3 h-3" />
                        {date.toLocaleDateString('pt-BR')}
                      </span>
                      {log.acao.includes('PRODUTO') && (
                        <span className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Produto Modificado</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${colorClass}`}>
                    {log.acao.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            )
          })}

          {filteredLogs.length === 0 && (
            <div className="py-20 text-center">
              <History className="w-12 h-12 text-gray-800 mx-auto mb-4 opacity-20" />
              <p className="text-gray-500 text-sm font-medium">Nenhum registro encontrado para este filtro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
