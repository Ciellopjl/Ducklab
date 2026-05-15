'use client'
/* eslint-disable react/no-unescaped-entities */

import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X,
  Tag,
  Smile,
  Type,
  ListTree,
  CheckSquare,
  Square
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'

export default function CategoriasAdmin() {
  const { categorias, adicionarCategoria, editarCategoria, excluirCategoria, loadingStates, carregarRecurso } = useAdminStore()
  
  // Sincronização granular: carrega apenas categorias, muito mais rápido
  useSWR('admin-categorias', () => carregarRecurso('categorias'), { refreshInterval: 10000 })

  const [formAberto, setFormAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', label: '', icone: '', adicionaisHabilitados: true })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Zero delay: fecha o modal e limpa estado imediatamente
    setFormAberto(false)
    setEditandoId(null)

    try {
      if (editandoId) {
        await editarCategoria(editandoId, form)
        toast.success('Categoria atualizada!')
      } else {
        await adicionarCategoria(form)
        toast.success('Categoria criada!')
      }
      setForm({ nome: '', label: '', icone: '', adicionaisHabilitados: true })
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar categoria')
    }
  }

  const estaCarregando = loadingStates['categorias'] && categorias.length === 0

  if (estaCarregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
        <p className="text-gray-500 animate-pulse">Carregando categorias...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
             <ListTree className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
             Categorias
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Organize seu cardápio em seções</p>
        </div>
        <button 
          onClick={() => {
            setForm({ nome: '', label: '', icone: '', adicionaisHabilitados: true })
            setEditandoId(null)
            setFormAberto(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {categorias.map((cat) => (
          <motion.div 
            layout
            key={cat.id}
            className="glass-card p-3 md:p-5 border border-white/5 hover:border-white/10 transition-all flex flex-col items-center text-center justify-between group gap-3 h-full"
          >

            
            {/* Informações */}
            <div className="w-full min-h-0 flex flex-col items-center">
              <h3 className="text-white font-black text-xs md:text-sm leading-tight line-clamp-2 min-h-[28px] uppercase">
                {cat.label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]/gu, '').trim()}
              </h3>
              <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest truncate mt-1 w-full">{cat.nome}</p>
            </div>
            
            {/* Ações */}
            <div className="grid grid-cols-2 gap-1.5 w-full pt-3 mt-auto border-t border-white/5">
              <button 
                onClick={() => {
                  setForm({ nome: cat.nome, label: cat.label, icone: cat.icone, adicionaisHabilitados: cat.adicionaisHabilitados ?? true })
                  setEditandoId(cat.id)
                  setFormAberto(true)
                }}
                className="flex items-center justify-center py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all active:scale-95"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                onClick={async () => {
                  if (confirm('Excluir categoria? Isso pode afetar produtos vinculados.')) {
                    try {
                      await excluirCategoria(cat.id)
                      toast.success('Categoria excluída!')
                    } catch (err) {
                      toast.error('Erro ao excluir categoria')
                    }
                  }
                }}
                className="flex items-center justify-center py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500/70 hover:text-red-400 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
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
                       rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editandoId ? 'Editar' : 'Nova'} Categoria</h2>
              <button onClick={() => setFormAberto(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome (Slug)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                    placeholder="ex: lanches-artesanais"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rótulo (Exibição)</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input 
                    type="text"
                    required
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                    placeholder="ex: Lanches Artesanais"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                   onClick={() => setForm(f => ({ ...f, adicionaisHabilitados: !f.adicionaisHabilitados }))}>
                <div>
                  <label className="block text-sm font-bold text-white uppercase mb-0.5 cursor-pointer">Permitir Adicionais</label>
                  <p className="text-xs text-gray-500">Se ativo, clientes poderão incluir itens extras nos produtos desta categoria.</p>
                </div>
                {form.adicionaisHabilitados ? (
                  <CheckSquare className="w-6 h-6 text-orange-500" />
                ) : (
                  <Square className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <button 
                type="submit" 
                className="w-full btn-primary py-4 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar Categoria
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
