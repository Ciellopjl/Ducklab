'use client'
/* eslint-disable react-hooks/exhaustive-deps */

import {
  Plus,
  Ticket,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Percent,
  Banknote
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '@/store/adminStore'
import { Cupom } from '@/data/types'
import { formatarPreco } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function CuponsPage() {
  const { cupons, carregarCupons, adicionarCupom, editarCupom, excluirCupom, carregando, erro } = useAdminStore()
  const [modalAberto, setModalAberto] = useState(false)
  const [cupomEditando, setCupomEditando] = useState<Cupom | null>(null)

  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'porcentagem' as 'porcentagem' | 'valor',
    valor: '',
    pedidoMinimo: '',
    validade: '',
    ativo: true,
  })

  useEffect(() => {
    carregarCupons()
  }, [carregarCupons])

  const handleAbrirModal = (cupom?: Cupom) => {
    if (cupom) {
      setCupomEditando(cupom)
      setFormData({
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: cupom.valor.toString(),
        pedidoMinimo: cupom.pedidoMinimo.toString(),
        validade: cupom.validade ? new Date(cupom.validade).toISOString().split('T')[0] : '',
        ativo: cupom.ativo,
      })
    } else {
      setCupomEditando(null)
      setFormData({
        codigo: '',
        tipo: 'porcentagem',
        valor: '',
        pedidoMinimo: '',
        validade: '',
        ativo: true,
      })
    }
    setModalAberto(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const dados = {
      ...formData,
      valor: parseFloat(formData.valor),
      pedidoMinimo: parseFloat(formData.pedidoMinimo || '0'),
      validade: formData.validade || null,
    }

    try {
      if (cupomEditando) {
        await editarCupom(cupomEditando.id, dados)
        toast.success('Cupom atualizado!')
      } else {
        await adicionarCupom(dados)
        toast.success('Cupom criado!')
      }

      setModalAberto(false)
    } catch (err) {
      toast.error('Erro ao salvar cupom')
    }
  }

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      try {
        await excluirCupom(id)
        toast.success('Cupom excluído!')
      } catch (err) {
        toast.error('Erro ao excluir cupom')
      }
    }
  }

  const handleToggleAtivo = async (cupom: Cupom) => {
    try {
      await editarCupom(cupom.id, { ativo: !cupom.ativo })
      toast.success(cupom.ativo ? 'Cupom desativado' : 'Cupom ativado')
    } catch (err) {
      toast.error('Erro ao alterar status do cupom')
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
            <Ticket className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            Gestão de Cupons
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Configure descontos e promoções especiais</p>
        </div>

        <button
          onClick={() => handleAbrirModal()}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
        >
          <Plus className="w-5 h-5" />
          Novo Cupom
        </button>
      </div>

      {/* Alerta de Erro */}
      <AnimatePresence>
        {erro && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{erro}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Cupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {Array.isArray(cupons) && cupons.map((cupom, index) => (
            <motion.div
              key={cupom.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`glass-card p-4 md:p-6 border transition-all ${cupom.ativo ? 'border-white/10' : 'border-white/5 opacity-60'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${cupom.tipo === 'porcentagem' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                    {cupom.tipo === 'porcentagem' ? <Percent className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wider">{cupom.codigo}</h3>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      {cupom.tipo === 'porcentagem' ? 'Desconto em %' : 'Desconto Fixo'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAbrirModal(cupom)}
                    className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExcluir(cupom.id)}
                    className="p-2 hover:bg-orange-500/10 rounded-xl text-gray-400 hover:text-orange-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Valor do Desconto</span>
                  <span className="text-white font-bold text-lg">
                    {cupom.tipo === 'porcentagem' ? `${cupom.valor}%` : formatarPreco(cupom.valor)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Pedido Mínimo</span>
                  <span className="text-gray-200 font-medium">{formatarPreco(cupom.pedidoMinimo)}</span>
                </div>
                {cupom.validade && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Validade</span>
                    <span className="text-gray-200 text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-500" />
                      {new Date(cupom.validade).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleToggleAtivo(cupom)}
                className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${cupom.ativo
                    ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                    : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                  }`}
              >
                {cupom.ativo ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Ativo
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Inativo
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {cupons.length === 0 && !carregando && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <Ticket className="w-16 h-16 mb-4 opacity-20" />
            <p>Nenhum cupom cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Cupom */}
      <AnimatePresence>
        {modalAberto && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalAberto(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 
                         rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {cupomEditando ? 'Editar Cupom' : 'Novo Cupom'}
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-2">Código do Cupom</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MEBURGUE10"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-2">Tipo</label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                      >
                        <option value="porcentagem">Porcentagem (%)</option>
                        <option value="valor">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-2">
                        {formData.tipo === 'porcentagem' ? 'Porcentagem' : 'Valor'}
                      </label>
                      <input
                        type="number"
                        required
                        placeholder={formData.tipo === 'porcentagem' ? '10' : '5,00'}
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-2">Pedido Mínimo</label>
                      <input
                        type="number"
                        placeholder="0,00"
                        value={formData.pedidoMinimo}
                        onChange={(e) => setFormData({ ...formData, pedidoMinimo: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-2">Validade</label>
                      <input
                        type="date"
                        value={formData.validade}
                        onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <CheckCircle2 className={`w-5 h-5 ${formData.ativo ? 'text-orange-500' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Cupom Ativo</p>
                      <p className="text-[10px] text-gray-500">O cupom ficará disponível para uso imediatamente.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-6 h-6 rounded-lg bg-white/5 border-white/10 text-orange-600 focus:ring-orange-600 focus:ring-offset-black"
                    />
                  </div>
                </div>

                <div className="p-6 bg-black/20 border-t border-white/10 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] btn-primary px-4 py-3 font-bold flex items-center justify-center gap-2"
                  >
                    {carregando ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        {cupomEditando ? 'Salvar Alterações' : 'Criar Cupom'}
                      </>
                    )}
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
