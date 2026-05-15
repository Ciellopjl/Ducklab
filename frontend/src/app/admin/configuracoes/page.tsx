'use client'

import { useState } from 'react'
import { 
  Save, 
  MapPin, 
  Phone, 
  Clock, 
  DollarSign,
  ShieldCheck,
  Bell,
  UtensilsCrossed,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import ImagePicker from '@/components/admin/ImagePicker'

import { useAdminStore } from '@/store/adminStore'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import useSWR, { useSWRConfig } from 'swr'

export default function ConfiguracoesAdmin() {
  const { empresaAtiva, carregarRecurso } = useAdminStore()
  const { mutate } = useSWRConfig()
  
  // Carrega apenas os dados da empresa uma única vez (ou respeita o cache de 5min do store)
  useEffect(() => {
    carregarRecurso('empresa')
  }, [carregarRecurso])
  
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState({
    nome: empresaAtiva?.nome || '',
    slug: empresaAtiva?.slug || '',
    whatsapp: empresaAtiva?.whatsapp || '',
    logo: empresaAtiva?.logo || '',
    horarioAbertura: empresaAtiva?.horarioAbertura || '18:00',
    horarioFechamento: empresaAtiva?.horarioFechamento || '23:00',
    taxaEntrega: empresaAtiva?.taxaEntrega != null ? Number(empresaAtiva.taxaEntrega) : 5.0,
    endereco: empresaAtiva?.endereco || '',
    diasAbertos: empresaAtiva?.diasAbertos || '0,1,2,3,4,5,6',
  })

  // Função para formatar telefone dinamicamente
  const formatarTelefone = (val: string) => {
    let value = val.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2')
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2}).*/, '($1')
    }
    return value
  }

  // Só preenche o formulário se ele ainda estiver vazio (carregamento inicial)
  useEffect(() => {
    if (empresaAtiva && !formData.nome) { // Mudado de whatsapp para nome para ser mais confiável
      setFormData({
        nome: empresaAtiva.nome || '',
        slug: empresaAtiva.slug || '',
        whatsapp: formatarTelefone(empresaAtiva.whatsapp || ''),
        logo: empresaAtiva.logo || '',
        horarioAbertura: empresaAtiva.horarioAbertura || '18:00',
        horarioFechamento: empresaAtiva.horarioFechamento || '23:00',
        taxaEntrega: empresaAtiva.taxaEntrega != null ? Number(empresaAtiva.taxaEntrega) : 5.0,
        endereco: empresaAtiva.endereco || '',
        diasAbertos: empresaAtiva.diasAbertos || '0,1,2,3,4,5,6',
      })
    }
  }, [empresaAtiva])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    if (e.target.name === 'whatsapp') {
      value = formatarTelefone(value)
    }
    
    setFormData({ ...formData, [e.target.name]: value })
  }

  const toggleDia = (dia: number) => {
    const dias = formData.diasAbertos.split(',').filter(Boolean)
    const diaStr = dia.toString()
    
    let novosDias
    if (dias.includes(diaStr)) {
      novosDias = dias.filter((d: string) => d !== diaStr)
    } else {
      novosDias = [...dias, diaStr].sort()
    }
    
    setFormData({ ...formData, diasAbertos: novosDias.join(',') })
  }
  
  const handleSave = async () => {
    console.log('[DEBUG_CLIENT] Iniciando handleSave com dados:', formData)
    setSalvando(true)
    try {
      const res = await fetch('/api/admin/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        console.log('[DEBUG_CLIENT] Resposta OK!')
        toast.success('Configurações salvas!')
        await carregarRecurso('empresa', true)
        mutate('admin-data')
      } else {
        const erroJson = await res.json().catch(() => ({}))
        console.error('[DEBUG_CLIENT] Erro na resposta:', erroJson)
        toast.error(`Erro: ${erroJson.detalhes || erroJson.erro || 'Falha ao salvar'}`)
      }
    } catch (err: any) {
      console.error('[DEBUG_CLIENT] Erro de conexão:', err)
      toast.error('Erro de conexão ou servidor')
    } finally {
      setSalvando(false)
    }
  }


  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-xl md:text-3xl font-display font-black text-white tracking-tight">Configurações da Unidade</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie os dados, horários e endereço da sua loja.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dados da Loja */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-orange-600/10 rounded-lg text-orange-500">
              <Phone className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Contato e Localização</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">WhatsApp para Pedidos</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="text" 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="text" 
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Operação e Entrega */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Operação</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Abertura</label>
              <input 
                type="time" 
                name="horarioAbertura"
                value={formData.horarioAbertura}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fechamento</label>
              <input 
                type="time" 
                name="horarioFechamento"
                value={formData.horarioFechamento}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Taxa de Entrega Padrão (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="number" 
                name="taxaEntrega"
                step="0.10"
                value={formData.taxaEntrega}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-4">Dias de Funcionamento</label>
            <div className="flex flex-wrap gap-2">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((label, index) => {
                const isAberto = formData.diasAbertos.split(',').includes(index.toString())
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDia(index)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all min-w-[60px] flex-1 sm:flex-none ${
                      isAberto 
                        ? 'bg-orange-500/10 border-orange-500/30 text-white' 
                        : 'bg-white/5 border-white/5 text-gray-700'
                    }`}
                  >
                    <span className="text-[10px] font-black">{label}</span>
                    <div className={`w-2.5 h-2.5 rounded-full shadow-lg transition-all ${isAberto ? 'bg-green-500 shadow-green-500/50 scale-110' : 'bg-gray-800 scale-90'}`} />
                  </button>
                )
              })}
            </div>
            <p className="text-[9px] text-gray-600 font-bold uppercase mt-4 italic">
              Toque no dia para abrir (verde) ou fechar (cinza).
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-orange-200/60 leading-relaxed uppercase tracking-wider font-bold">
              Esses dados são exibidos no rodapé e usados no cálculo do checkout automatizado.
            </p>
          </div>
        </motion.div>

        {/* Segurança */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 border-l-4 border-green-600 lg:col-span-2 flex flex-col items-stretch md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-600/10 rounded-2xl text-green-500 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg md:text-xl">Acesso Master</h3>
              <p className="text-gray-500 text-sm">Logado como administrador proprietário.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button 
              onClick={handleSave}
              disabled={salvando}
              className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                salvando
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20'
              }`}
            >
              {salvando ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer info */}
      
    </div>
  )
}
