'use client'

import React, { useState, useMemo, memo, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useAdminStore } from '@/store/adminStore'
import { formatarPreco } from '@/lib/utils'
import { Produto } from '@/data/types'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Package,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { CardSkeleton } from '@/components/admin/AdminSkeletons'
import { shallow } from 'zustand/shallow'
import useSWR from 'swr'

// Carregamento dinâmico do formulário (só carrega se o usuário clicar em novo/editar)
const ProdutoForm = dynamic(() => import('@/components/admin/ProdutoForm'), {
  loading: () => <div className="p-10 animate-pulse bg-white/5 rounded-[3rem] h-[600px] flex items-center justify-center text-orange-500 font-black uppercase tracking-widest text-xs">Iniciando Engine de Edição...</div>,
  ssr: false
})

// --- Componentes Menores Memoizados ---

const ProdutoRow = memo(({ produto, onEdit, onDelete }: { produto: Produto, onEdit: (p: Produto) => void, onDelete: (id: string) => void }) => {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-orange-500/30 transition-colors">
            <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-contain" loading="lazy" />
          </div>
          <div className="min-w-0 flex flex-col items-start">
            <div className="flex items-center gap-2 w-full">
              <p className="font-bold text-white text-sm uppercase tracking-tight truncate">{produto.nome}</p>
              {produto.emPromocao && (
                <span className="shrink-0 px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[9px] font-black uppercase tracking-widest">
                  {produto.badgePromocao || 'Promo'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5 truncate max-w-[200px]">{produto.descricao}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
          produto.isPizza 
            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {produto.isPizza ? 'Variações' : 'Simples'}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {produto.emPromocao && produto.precoPromocional ? (
          <div className="flex flex-col items-center justify-center leading-tight">
            <span className="font-display font-bold text-gray-500 text-[10px] line-through">
              {formatarPreco(produto.preco)}
            </span>
            <span className="font-display font-black text-green-500 text-sm">
              {formatarPreco(produto.precoPromocional)}
            </span>
          </div>
        ) : (
          <span className="font-display font-black text-orange-500 text-sm">
            {formatarPreco(produto.preco)}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(produto)}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all active:scale-90"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (confirm('Deseja realmente excluir este produto?')) onDelete(produto.id)
            }}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500/70 hover:text-red-400 transition-all active:scale-90"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
})

ProdutoRow.displayName = 'ProdutoRow'

const ProdutoCardMobile = memo(({ produto, onEdit, onDelete }: { produto: Produto, onEdit: (p: Produto) => void, onDelete: (id: string) => void }) => {
  return (
    <div className="glass-card p-3 border border-white/5 flex flex-col justify-between h-full">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Imagem Centralizada */}
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shrink-0 group-hover:border-orange-500/30 transition-colors">
          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-contain" loading="lazy" />
        </div>
        
        {/* Informações */}
        <div className="w-full flex flex-col items-center min-h-0">
          <div className="flex flex-col items-center gap-1 min-h-[36px] justify-center w-full">
            <h3 className="font-black text-white text-[11px] uppercase leading-tight line-clamp-2 text-center">{produto.nome}</h3>
            {produto.emPromocao && (
              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[8px] font-black uppercase tracking-widest">
                {produto.badgePromocao || 'Promoção'}
              </span>
            )}
          </div>
          
          {produto.emPromocao && produto.precoPromocional ? (
            <div className="flex flex-col items-center mt-1 leading-tight">
              <span className="font-display font-bold text-gray-500 text-[9px] line-through">
                {formatarPreco(produto.preco)}
              </span>
              <span className="font-display font-black text-green-500 text-sm">
                {formatarPreco(produto.precoPromocional)}
              </span>
            </div>
          ) : (
            <span className="font-display font-black text-orange-500 text-sm mt-1">{formatarPreco(produto.preco)}</span>
          )}
          
          <div className="mt-2 flex gap-2 justify-center">
             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
              produto.isPizza 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {produto.isPizza ? 'Variações' : 'Simples'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Botões (Versão compacta para 2 colunas) */}
      <div className="grid grid-cols-2 gap-1.5 pt-4 mt-auto">
        <button 
          onClick={() => onEdit(produto)}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-gray-400 hover:text-white uppercase tracking-widest active:scale-95 transition-all"
        >
          <Pencil className="w-3 h-3" />
          Editar
        </button>
        <button 
          onClick={() => {
            if (confirm('Excluir produto?')) onDelete(produto.id)
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest active:scale-95 transition-all"
        >
          <Trash2 className="w-3 h-3" />
          Excluir
        </button>
      </div>
    </div>
  )
})

ProdutoCardMobile.displayName = 'ProdutoCardMobile'

// --- Componente Principal ---

export default function ProdutosAdmin() {
  const produtos = useAdminStore(state => state.produtos)
  const categorias = useAdminStore(state => state.categorias)
  const tamanhos = useAdminStore(state => state.tamanhos)
  const adicionarProduto = useAdminStore(state => state.adicionarProduto)
  const editarProduto = useAdminStore(state => state.editarProduto)
  const excluirProduto = useAdminStore(state => state.excluirProduto)
  const carregarDados = useAdminStore(state => state.carregarDados)
  const isLoading = useAdminStore(state => state.loadingStates['produtos'] || state.loadingStates['categorias'])

  useSWR('admin-produtos-data', () => carregarDados(), { 
    refreshInterval: 60000,
    revalidateOnFocus: false
  })
  
  const [formAberto, setFormAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas')

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    imagem: '',
    categoriaId: '',
    badge: '',
    isPizza: false,
    precos: [] as { tamanhoId: string, preco: number }[],
    // Promoção
    emPromocao: false,
    precoPromocional: '',
    badgePromocao: '',
  })

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const b = busca.toLowerCase()
      const matchesBusca = p.nome.toLowerCase().includes(b) || p.descricao.toLowerCase().includes(b)
      const matchesCategoria = categoriaAtiva === 'todas' || p.categoriaId === categoriaAtiva
      return matchesBusca && matchesCategoria
    })
  }, [produtos, busca, categoriaAtiva])

  const handleEdit = useCallback((produto: Produto) => {
    setForm({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString(),
      imagem: produto.imagem,
      categoriaId: produto.categoriaId,
      badge: produto.badge || '',
      isPizza: produto.isPizza || false,
      precos: produto.precos?.map((p: any) => ({ tamanhoId: p.tamanhoId, preco: p.preco })) || [],
      // Promoção
      emPromocao: produto.emPromocao || false,
      precoPromocional: produto.precoPromocional?.toString() || '',
      badgePromocao: produto.badgePromocao || '',
    })
    setEditandoId(produto.id)
    setFormAberto(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await excluirProduto(id)
      toast.success('Produto removido!')
    } catch (err) {
      toast.error('Erro ao excluir')
    }
  }, [excluirProduto])

  if (isLoading && (!produtos || produtos.length === 0)) {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <div className="w-48 h-8 bg-white/10 rounded-xl animate-pulse" />
          <div className="w-40 h-14 bg-white/5 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoriaId) return toast.error('Selecione uma categoria')

    const precoPromocionalFloat = parseFloat(String(form.precoPromocional).replace(',', '.')) || null

    const payload = {
      ...form,
      preco: parseFloat(String(form.preco).replace(',', '.')) || 0,
      // Garante que os campos de promoção chegam com tipos corretos na API
      emPromocao: Boolean(form.emPromocao),
      precoPromocional: form.emPromocao && precoPromocionalFloat && precoPromocionalFloat > 0
        ? precoPromocionalFloat
        : null,
      badgePromocao: form.emPromocao && form.badgePromocao
        ? String(form.badgePromocao).trim()
        : null,
    }

    setFormAberto(false)

    try {
      if (editandoId) {
        await editarProduto(editandoId, payload as any)
        toast.success('Produto atualizado!')
      } else {
        await adicionarProduto(payload as any)

        toast.success('Produto criado!')
      }
    } catch (err) {
      toast.error('Erro ao salvar')
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-500">
              <Package className="w-6 h-6" />
            </div>
            Cardápio
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Gestão inteligente de produtos</p>
        </div>
        
        <button
          onClick={() => {
            setForm({ nome: '', descricao: '', preco: '', imagem: '', categoriaId: '', badge: '', isPizza: false, precos: [], emPromocao: false, precoPromocional: '', badgePromocao: '' })
            setEditandoId(null)
            setFormAberto(true)
          }}
          className="bg-orange-600 hover:bg-orange-500 text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all text-sm font-bold"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setCategoriaAtiva('todas')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              categoriaAtiva === 'todas' ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                categoriaAtiva === cat.id ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listagem */}
      <div className="space-y-4">
        {/* Desktop */}
        <div className="hidden md:block glass-card overflow-hidden border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500">Produto</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500">Tipo</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-gray-500">Preço</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {produtosFiltrados.map((produto) => (
                <ProdutoRow key={produto.id} produto={produto} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {produtosFiltrados.map((produto) => (
            <ProdutoCardMobile key={produto.id} produto={produto} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {/* Modal dinâmico */}
      <AnimatePresence>
        {formAberto && (
          <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center md:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormAberto(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl bg-[#080808] border-t md:border border-white/10 
                         rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0a0a0a]">
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                  {editandoId ? 'Editar Item' : 'Novo Item'}
                </h2>
                <button onClick={() => setFormAberto(false)} className="p-2 text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <Suspense fallback={<div className="p-20 text-center font-black uppercase text-xs text-orange-500 animate-pulse">Iniciando Formulário...</div>}>
                <ProdutoForm 
                  form={form} 
                  setForm={setForm} 
                  editandoId={editandoId} 
                  categorias={categorias} 
                  tamanhos={tamanhos} 
                  onSubmit={handleSubmit} 
                  onClose={() => setFormAberto(false)} 
                />
              </Suspense>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
