'use client'

import React, { useMemo } from 'react'
import { Save, Layers, DollarSign, Tag, Percent, Zap, X } from 'lucide-react'
import ImagePicker from './ImagePicker'
import { Categoria, Tamanho } from '@/data/types'

interface ProdutoFormProps {
  form: any
  setForm: (f: any) => void
  editandoId: string | null
  categorias: Categoria[]
  tamanhos: Tamanho[]
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

const BADGES_SUGERIDOS = ['-10%', '-15%', '-20%', '-25%', '-30%', '-50%', 'OFERTA', 'IMPERDÍVEL', 'LEVE 2 PAGUE 1', 'COMBO']

export default function ProdutoForm({
  form,
  setForm,
  editandoId,
  categorias,
  onSubmit,
}: ProdutoFormProps) {

  const precoBase = parseFloat(String(form.preco).replace(',', '.')) || 0
  const precoPromo = parseFloat(String(form.precoPromocional).replace(',', '.')) || 0
  const percentualDesconto = useMemo(() => {
    if (!precoBase || !precoPromo || precoPromo >= precoBase) return null
    return Math.round(((precoBase - precoPromo) / precoBase) * 100)
  }, [precoBase, precoPromo])

  return (
    <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide bg-[#080808]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">

        {/* Lado Esquerdo: Info */}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Nome do Produto</label>
            <input
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-orange-500/50 focus:bg-white/[0.08] transition-all font-bold text-lg"
              placeholder="Ex: M.E Burger Bacon"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Descrição Detalhada</label>
            <textarea
              required
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-white outline-none focus:border-orange-500/50 focus:bg-white/[0.08] transition-all resize-none text-sm placeholder:text-gray-700"
              placeholder="Quais os ingredientes? Ex: Pão brioche, 180g carne, cheddar..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Categoria</label>
              <div className="relative group">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                <select
                  required
                  value={form.categoriaId}
                  onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500/50 appearance-none font-bold"
                >
                  <option value="" disabled className="bg-black">Selecione...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-black text-white">{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Preço Base (R$)</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500/50 font-mono font-bold"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Imagem */}
        <div className="space-y-6">
          <div className="p-2 bg-white/5 rounded-3xl border border-white/5">
            <ImagePicker
              label="Imagem do Produto"
              value={form.imagem}
              onChange={(url) => setForm({ ...form, imagem: url })}
              description="IA Pro ativada para remover fundo automaticamente."
              processWithIA={true}
            />
          </div>
        </div>
      </div>

      {/* ─── SEÇÃO DE PROMOÇÃO ─── */}
      <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
        form.emPromocao
          ? 'border-orange-500/40 bg-gradient-to-br from-orange-950/30 to-orange-900/10'
          : 'border-white/8 bg-white/[0.02]'
      }`}>
        {/* Toggle Header */}
        <button
          type="button"
          onClick={() => setForm({
            ...form,
            emPromocao: !form.emPromocao,
            precoPromocional: !form.emPromocao ? form.precoPromocional : '',
            badgePromocao: !form.emPromocao ? form.badgePromocao : '',
          })}
          className="w-full flex items-center justify-between p-5 md:p-6 group"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-2xl transition-all ${
              form.emPromocao ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white/5 text-gray-500'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className={`text-sm font-black uppercase tracking-tight transition-colors ${
                form.emPromocao ? 'text-orange-400' : 'text-gray-400'
              }`}>
                Ativar Promoção
              </p>
              <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                Defina um preço especial e badge para este produto
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className={`relative w-14 h-7 rounded-full transition-all duration-300 border ${
            form.emPromocao
              ? 'bg-orange-500 border-orange-400'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 shadow-md ${
              form.emPromocao
                ? 'left-8 bg-white'
                : 'left-1 bg-gray-500'
            }`} />
          </div>
        </button>

        {/* Campos de Promoção (visíveis apenas quando ativa) */}
        {form.emPromocao && (
          <div className="px-5 md:px-6 pb-6 space-y-6 border-t border-orange-500/20 pt-5">

            {/* Preço Promocional + Desconto calculado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">
                  Preço Promocional (R$)
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.precoPromocional}
                    onChange={(e) => setForm({ ...form, precoPromocional: e.target.value })}
                    className={`w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 text-white outline-none font-mono font-bold placeholder:text-gray-700 transition-all ${
                      precoBase > 0 && precoPromo >= precoBase
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-orange-500/30 focus:border-orange-500'
                    }`}
                    placeholder="0,00"
                  />
                </div>
                {/* Alerta de erro ou Badge de desconto calculado */}
                {precoBase > 0 && precoPromo >= precoBase ? (
                   <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest mt-2 px-1">
                     ⚠️ Desconto deve ser menor que R$ {precoBase.toFixed(2).replace('.', ',')}
                   </p>
                ) : percentualDesconto !== null && percentualDesconto > 0 ? (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-xl">
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                      -{percentualDesconto}% de desconto
                    </span>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">
                  Badge de Destaque
                </label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    value={form.badgePromocao}
                    onChange={(e) => setForm({ ...form, badgePromocao: e.target.value })}
                    className="w-full bg-black/40 border border-orange-500/30 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500 font-bold placeholder:text-gray-700"
                    placeholder="Ex: -20%, OFERTA..."
                    maxLength={30}
                  />
                </div>
              </div>
            </div>

            {/* Sugestões de badge */}
            <div>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Sugestões rápidas</p>
              <div className="flex flex-wrap gap-2">
                {BADGES_SUGERIDOS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setForm({ ...form, badgePromocao: b })}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                      form.badgePromocao === b
                        ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 text-gray-500 border-white/5 hover:border-orange-500/30 hover:text-orange-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
                {form.badgePromocao && !BADGES_SUGERIDOS.includes(form.badgePromocao) && (
                  <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white border border-orange-400">
                    {form.badgePromocao}
                  </span>
                )}
              </div>
            </div>

            {/* Preview */}
            {(form.precoPromocional || form.badgePromocao) && (
              <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Preview no cardápio</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 text-xl shrink-0">
                    🍔
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white text-sm truncate">{form.nome || 'Nome do Produto'}</p>
                      {form.badgePromocao && (
                        <span className="text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-lg uppercase">
                          {form.badgePromocao}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {precoBase > 0 && precoPromo > 0 && precoPromo < precoBase && (
                        <span className="text-xs text-gray-500 line-through font-mono">
                          R$ {precoBase.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="text-sm font-black text-orange-500 font-mono">
                        R$ {(precoPromo > 0 ? precoPromo : precoBase).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-2 sticky bottom-0 bg-[#080808]/80 backdrop-blur-md">
        <button
          type="submit"
          disabled={form.emPromocao && precoBase > 0 && precoPromo >= precoBase}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 disabled:text-gray-500 text-white py-5 rounded-2xl font-black text-base 
                     flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] disabled:active:scale-100"
        >
          <Save className="w-5 h-5" />
          {editandoId ? 'SALVAR ALTERAÇÕES' : 'CRIAR PRODUTO AGORA'}
        </button>
      </div>
    </form>
  )
}
