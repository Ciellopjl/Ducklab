'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Save, X, Megaphone, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { criarPromocao, atualizarPromocao, excluirPromocao } from '@/app/actions/promocoes'
import { toast } from 'react-hot-toast'

interface Promocao {
  id: string
  titulo: string
  descricao: string
  tag: string
  icone: string
  cor: string
  corBorda: string
}

const gradientOptions = [
  { label: 'Laranja M.E', value: 'from-[#FF4D00] to-orange-800', border: 'border-[#FF4D00]' },
  { label: 'Preto Premium', value: 'from-zinc-900 to-black', border: 'border-white/10' },
  { label: 'Dark Laranja', value: 'from-[#FF4D00]/20 to-black', border: 'border-[#FF4D00]/30' },
  { label: 'Glass / Vidro', value: 'from-white/10 to-transparent', border: 'border-white/20' },
  { label: 'Vermelho Fogo', value: 'from-red-600 to-red-900', border: 'border-red-500' },
]

export default function PromocoesClient({ initialData }: { initialData: Promocao[] }) {
  const [promocoes, setPromocoes] = useState<Promocao[]>(initialData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState<Promocao | null>(null)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tag: '',
    icone: '',
    cor: gradientOptions[0].value,
    corBorda: gradientOptions[0].border,
  })

  async function reloadData() {
    try {
      const res = await fetch('/api/promocoes')
      if (res.ok) {
        const data = await res.json()
        setPromocoes(data)
      }
    } catch (err) {
      console.error('Erro ao recarregar promoções:', err)
    }
  }

  const handleOpenModal = (promo?: Promocao) => {
    if (promo) {
      setEditando(promo)
      setFormData({
        titulo: promo.titulo,
        descricao: promo.descricao,
        tag: promo.tag,
        icone: promo.icone,
        cor: promo.cor,
        corBorda: promo.corBorda,
      })
    } else {
      setEditando(null)
      setFormData({
        titulo: '',
        descricao: '',
        tag: '',
        icone: '',
        cor: gradientOptions[0].value,
        corBorda: gradientOptions[0].border,
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editando) {
        await atualizarPromocao(editando.id, formData)
        toast.success('Promoção atualizada!')
      } else {
        await criarPromocao(formData)
        toast.success('Promoção criada!')
      }
      setIsModalOpen(false)
      await reloadData()
    } catch (err) {
      toast.error('Erro ao salvar promoção')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta promoção? Ela sairá da página inicial imediatamente.')) return
    try {
      await excluirPromocao(id)
      toast.success('Promoção excluída')
      await reloadData()
    } catch (err) {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
            <Megaphone className="text-orange-500 w-6 h-6 md:w-8 md:h-8" />
            Gerenciar Promoções
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie os banners de destaque da sua página inicial.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nova Promoção
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {promocoes.map((promo) => (
            <motion.div
              key={promo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.cor} p-6 border ${promo.corBorda} group shadow-xl`}
            >
              <div className="absolute top-4 right-4 flex gap-2 z-20">
                <button
                  onClick={() => handleOpenModal(promo)}
                  className="p-3 bg-white/20 hover:bg-white/40 rounded-xl text-white transition-all shadow-lg backdrop-blur-md active:scale-90"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="p-3 bg-red-600/60 hover:bg-red-600/90 rounded-xl text-white transition-all shadow-lg backdrop-blur-md active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-4 backdrop-blur-md uppercase tracking-wider">
                  {promo.tag}
                </span>
                <div className="text-4xl mb-3">{promo.icone}</div>
                <h3 className="text-xl font-display font-bold text-white mb-2 leading-tight">
                  {promo.titulo}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {promo.descricao}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {promocoes.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl">Nenhuma promoção ativa</h3>
            <p className="text-gray-500 mt-2">Adicione uma promoção para destacar seus combos!</p>
          </div>
        )}
      </div>

      {/* Modal / Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full max-w-lg bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <h2 className="text-xl font-bold text-white">
                  {editando ? 'Editar Promoção' : 'Nova Promoção'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium text-gray-400">Título</label>
                    <input
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Ex: Combo M.E burgue"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium text-gray-400">Tag (Pequena)</label>
                    <input
                      required
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Ex: COMBO ou NOVO"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Descrição</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                    placeholder="Descrição da oferta..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Ícone (Opcional)</label>
                    <input
                      value={formData.icone}
                      onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl focus:border-orange-500 outline-none transition-all"
                      placeholder="🔥"
                    />
                  </div>
                  <div className="space-y-2 text-center pt-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Preview Cores</span>
                    <div className={`w-full h-12 rounded-xl bg-gradient-to-br ${formData.cor} border ${formData.corBorda}`} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Estilo do Card
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {gradientOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, cor: opt.value, corBorda: opt.border })}
                        className={`h-10 rounded-lg bg-gradient-to-br ${opt.value} border-2 transition-all ${
                          formData.cor === opt.value ? 'border-white' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-900 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {editando ? 'Salvar Alterações' : 'Criar Promoção'}
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
