'use client'

import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { 
  Plus, 
  Trash2, 
  Save, 
  X,
  Maximize,
  Type,
  Hash,
  ArrowUpDown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'

export default function TamanhosAdmin() {
  const { tamanhos, adicionarTamanho, excluirTamanho, carregando, carregarDados } = useAdminStore()
  
  // Real-time sync
  useSWR('admin-data', () => carregarDados(), { refreshInterval: 10000 })

  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState({ nome: '', sigla: '', maxSabores: 1, ordem: 0 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adicionarTamanho(form)
      toast.success('Tamanho adicionado!')
      setForm({ nome: '', sigla: '', maxSabores: 1, ordem: 0 })
      setFormAberto(false)
    } catch (err) {
      toast.error('Erro ao salvar tamanho')
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
             <Maximize className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
             Tamanhos Disponíveis
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie os tamanhos disponíveis (P, M, G, etc.)</p>
        </div>
        <button 
          onClick={() => {
            setForm({ nome: '', sigla: '', maxSabores: 1, ordem: 0 })
            setFormAberto(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Tamanho
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tamanhos.sort((a, b) => a.ordem - b.ordem).map((tam) => (
          <motion.div 
            layout
            key={tam.id}
            className="glass-card p-4 md:p-6 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-xl bg-orange-600/10 w-12 h-12 rounded-xl flex items-center justify-center border border-orange-500/20 text-orange-500 font-bold">
                {tam.sigla || tam.nome[0]}
              </div>
              <div>
                <h3 className="text-white font-bold">{tam.nome}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Até {tam.maxSabores} {tam.maxSabores === 1 ? 'opção' : 'opções'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  if (confirm('Excluir este tamanho? Isso pode afetar preços vinculados.')) {
                    try {
                      await excluirTamanho(tam.id)
                      toast.success('Tamanho excluído!')
                    } catch (err) {
                      toast.error('Erro ao excluir')
                    }
                  }
                }}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-orange-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {tamanhos.length === 0 && !carregando && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-gray-500">Nenhum tamanho cadastrado.</p>
          </div>
        )}
      </div>

      {formAberto && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setFormAberto(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 
                       rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Novo Tamanho</h2>
              <button onClick={() => setFormAberto(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Tamanho</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                    placeholder="ex: Grande"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sigla</label>
                  <input 
                    type="text"
                    required
                    value={form.sigla}
                    onChange={(e) => setForm({ ...form, sigla: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-orange-500/50"
                    placeholder="ex: G"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Máx. Sabores</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={form.maxSabores}
                    onChange={(e) => setForm({ ...form, maxSabores: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ordem de Exibição</label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="number"
                    required
                    value={form.ordem}
                    onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={carregando}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar Tamanho
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
