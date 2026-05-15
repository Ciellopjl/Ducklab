'use client'

import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { 
  Plus, 
  Trash2, 
  Save, 
  X,
  Beef,
  Type,
  ListTree,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import useSWR from 'swr'
import ImagePicker from '@/components/admin/ImagePicker'

export default function SaboresAdmin() {
  const { sabores, categorias, adicionarSabor, excluirSabor, carregando, carregarDados } = useAdminStore()
  
  // Real-time sync
  useSWR('admin-data', () => carregarDados(), { refreshInterval: 10000 })

  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState({ 
    nome: '', 
    descricao: '', 
    categoriaId: '', 
    imagem: '',
    precoAdicional: 0 
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoriaId) return toast.error('Selecione uma categoria')
    
    // Zero delay: fecha modal e limpa estado imediatamente
    setFormAberto(false)

    try {
      await adicionarSabor(form)
      toast.success('Sabor adicionado!')
      setForm({ nome: '', descricao: '', categoriaId: '', imagem: '', precoAdicional: 0 })
    } catch (err) {
      toast.error('Erro ao salvar sabor')
    }
  }

  // Filtrar categorias (removido filtro de pizza)
  const categoriasBurger = categorias;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
             <Beef className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
             Ingredientes Selecionados
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie os sabores e recheios disponíveis</p>
        </div>
        <button 
          onClick={() => {
            setForm({ nome: '', descricao: '', categoriaId: categoriasBurger[0]?.id || '', imagem: '', precoAdicional: 0 })
            setFormAberto(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Sabor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sabores.map((sabor) => (
          <motion.div 
            layout
            key={sabor.id}
            className="glass-card overflow-hidden border border-white/5 hover:border-white/10 transition-all flex flex-col"
          >
            <div className="h-40 bg-white/5 relative">
              {sabor.imagem ? (
                <img src={sabor.imagem} alt={sabor.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  <Beef className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                 <button 
                  onClick={async () => {
                    if (confirm('Excluir este sabor?')) {
                      try {
                        await excluirSabor(sabor.id)
                        toast.success('Sabor excluído!')
                      } catch (err) {
                        toast.error('Erro ao excluir')
                      }
                    }
                  }}
                  className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-bold text-lg">{sabor.nome}</h3>
                {sabor.precoAdicional > 0 && (
                  <span className="text-[10px] bg-orange-600/20 text-orange-500 px-2 py-0.5 rounded-full font-bold">
                    +{sabor.precoAdicional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                {sabor.descricao || 'Sem descrição cadastrada.'}
              </p>
              <div className="pt-2">
                <span className="text-[9px] text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                  {categorias.find(c => c.id === sabor.categoriaId)?.label || 'Sem Categoria'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {sabores.length === 0 && !carregando && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <Beef className="w-16 h-16 text-gray-800 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">Nenhum sabor cadastrado ainda.</p>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setFormAberto(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 
                         rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
                <h2 className="text-xl font-bold text-white">Novo Ingrediente</h2>
                <button onClick={() => setFormAberto(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Ingrediente</label>
                      <div className="relative">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          type="text"
                          required
                          value={form.nome}
                          onChange={(e) => setForm({ ...form, nome: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                          placeholder="ex: Cheddar Cremoso"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categoria</label>
                      <div className="relative">
                        <ListTree className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <select 
                          required
                          value={form.categoriaId}
                          onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50 appearance-none"
                        >
                          <option value="" disabled className="bg-black">Selecione...</option>
                          {categoriasBurger.map(c => (
                            <option key={c.id} value={c.id} className="bg-black">{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preço Adicional (Opcional)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          type="number"
                          step="0.01"
                          value={form.precoAdicional}
                          onChange={(e) => setForm({ ...form, precoAdicional: parseFloat(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <ImagePicker 
                      label="Imagem do Sabor"
                      value={form.imagem}
                      onChange={(url) => setForm({ ...form, imagem: url })}
                      description="Selecione uma foto do recheio."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição / Ingredientes</label>
                  <textarea 
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-orange-500/50 min-h-[100px]"
                    placeholder="ex: Molho de tomate, mussarela, calabresa fatiada e cebola."
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Ingrediente
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
