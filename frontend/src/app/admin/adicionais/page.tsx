'use client'

import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { 
  Plus, 
  Trash2, 
  Save, 
  X,
  Wrench,
  Type,
  DollarSign
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'

export default function AdicionaisAdmin() {
  const { adicionais, adicionarAdicional, editarAdicional, excluirAdicional, carregando, carregarRecurso } = useAdminStore()
  
  // Carrega apenas os adicionais respeitando o cache do store
  useEffect(() => {
    carregarRecurso('adicionais')
  }, [carregarRecurso])

  const [formAberto, setFormAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', preco: 0, disponivel: true })

  const handleOpenForm = (adicional?: any) => {
    if (adicional) {
      setEditandoId(adicional.id)
      setForm({ 
        nome: adicional.nome, 
        preco: adicional.preco, 
        disponivel: adicional.disponivel ?? true 
      })
    } else {
      setEditandoId(null)
      setForm({ nome: '', preco: 0, disponivel: true })
    }
    setFormAberto(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Fecha o modal instantaneamente para zero delay
    setFormAberto(false)
    
    try {
      if (editandoId) {
        await editarAdicional(editandoId, form)
        toast.success('Adicional atualizado!')
      } else {
        await adicionarAdicional(form)
        toast.success('Adicional adicionado!')
      }
    } catch (err) {
      // O store já faz o rollback, aqui apenas notificamos o erro
      toast.error('Erro ao salvar adicional')
      // Opcional: reabrir o form em caso de erro crítico
      // setFormAberto(true)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500">
               <Wrench className="w-6 h-6 md:w-7 md:h-7" />
             </div>
             Adicionais e Bordas
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie bordas recheadas e ingredientes extras</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Adicional
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {adicionais.map((ad) => (
          <motion.div 
            layout
            key={ad.id}
            className={`glass-card p-3 md:p-6 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col ${!ad.disponivel ? 'opacity-60' : ''}`}
          >
            {/* Status Badge */}
            <div className="absolute top-0 right-0 p-1 z-10">
              <span className={`text-[8px] md:text-[10px] font-black uppercase px-1.5 md:px-2 py-0.5 rounded-bl-xl shadow-lg backdrop-blur-md ${ad.disponivel ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {ad.disponivel ? 'ON' : 'OFF'}
              </span>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 flex-1">
              <div className="flex items-center gap-2 md:gap-4 flex-1 mt-3 md:mt-0">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Plus className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold truncate text-xs md:text-base leading-tight">{ad.nome}</h3>
                  <p className="text-[10px] md:text-sm text-orange-500 font-black uppercase tracking-widest mt-0.5">
                    {(ad.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
                <button 
                  onClick={() => handleOpenForm(ad)}
                  className="flex-1 flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-gray-300 hover:text-white transition-all text-[10px] md:text-xs font-bold"
                >
                  <Wrench className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  Editar
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Excluir este adicional?')) {
                      try {
                        await excluirAdicional(ad.id)
                        toast.success('Adicional excluído!')
                      } catch (err) {
                        toast.error('Erro ao excluir')
                      }
                    }
                  }}
                  className="p-1.5 md:p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg md:rounded-xl text-red-400 hover:text-red-300 transition-all shrink-0"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {adicionais.length === 0 && !carregando && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-gray-500 font-medium">Nenhum adicional cadastrado.</p>
            <p className="text-gray-700 text-sm mt-1">Comece clicando em "Novo Adicional"</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {formAberto && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setFormAberto(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 
                         rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-display font-black text-white">
                    {editandoId ? 'Editar Adicional' : 'Novo Adicional'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-widest">Preencha as informações abaixo</p>
                </div>
                <button 
                  onClick={() => setFormAberto(false)} 
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Nome do Adicional</label>
                    <div className="relative group">
                      <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        type="text"
                        required
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-medium"
                        placeholder="ex: Borda de Catupiry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Preço (R$)</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        type="number"
                        step="0.01"
                        required
                        value={form.preco}
                        onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Disponível</span>
                      <span className="text-[10px] text-gray-500">Ocultar adicional do cardápio</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, disponivel: !form.disponivel })}
                      className={`w-12 h-6 rounded-full transition-all relative ${form.disponivel ? 'bg-orange-600' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.disponivel ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setFormAberto(false)}
                    className="flex-1 py-4 px-6 border border-white/10 rounded-2xl text-gray-400 font-bold hover:bg-white/5 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 shadow-orange-600/40"
                  >
                    <Save className="w-5 h-5" />
                    {editandoId ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
