import { create } from 'zustand'
import { Produto, Categoria, Promocao, Cupom, Tamanho, Sabor, Adicional } from '@/data/types'
import { toast } from 'react-hot-toast'
import { mutate } from 'swr'

interface AdminState {
  produtos: Produto[]
  categorias: Categoria[]
  promocoes: Promocao[]
  tamanhos: Tamanho[]
  sabores: Sabor[]
  adicionais: Adicional[]
  empresaAtiva: any | null
  carregando: boolean
  loadingStates: Record<string, boolean>
  erro: string | null
  _lastFetched: Record<string, number>

  pedidos: any[]
  cupons: Cupom[]
  carregarDados: (force?: boolean) => Promise<void>
  carregarRecurso: (recurso: 'produtos' | 'categorias' | 'tamanhos' | 'sabores' | 'adicionais' | 'empresa' | 'pedidos' | 'cupons', force?: boolean) => Promise<void>
  carregarPedidos: () => Promise<void>
  atualizarStatusPedido: (id: string, status: string) => Promise<void>
  limparPedidos: () => Promise<void>

  adicionarProduto: (produto: Partial<Produto>) => Promise<void>
  editarProduto: (id: string, dados: Partial<Produto>) => Promise<void>
  excluirProduto: (id: string) => Promise<void>

  adicionarCategoria: (dados: { nome: string, label: string, icone: string, adicionaisHabilitados: boolean }) => Promise<void>
  editarCategoria: (id: string, dados: Partial<Categoria>) => Promise<void>
  excluirCategoria: (id: string) => Promise<void>

  carregarCupons: () => Promise<void>
  adicionarCupom: (dados: Omit<Cupom, 'id'>) => Promise<void>
  editarCupom: (id: string, dados: Partial<Cupom>) => Promise<void>
  excluirCupom: (id: string) => Promise<void>

  adicionarTamanho: (dados: Partial<Tamanho>) => Promise<void>
  excluirTamanho: (id: string) => Promise<void>
  adicionarSabor: (dados: Partial<Sabor>) => Promise<void>
  excluirSabor: (id: string) => Promise<void>
  adicionarAdicional: (dados: Partial<Adicional>) => Promise<void>
  editarAdicional: (id: string, dados: Partial<Adicional>) => Promise<void>
  excluirAdicional: (id: string) => Promise<void>
}

// Cache TTL: 5 minutos — dados estáticos (cardápio) não mudam com frequência
// Forçar refetch explícito com force=true quando necessário (após criar/editar/deletar)
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

export const useAdminStore = create<AdminState>((set, get) => ({
  produtos: [],
  categorias: [],
  promocoes: [],
  tamanhos: [],
  sabores: [],
  adicionais: [],
  pedidos: [],
  cupons: [],
  empresaAtiva: null,
  carregando: false,
  loadingStates: {},
  erro: null,
  _lastFetched: {},

  carregarRecurso: async (recurso, force = false) => {
    const key = recurso === 'empresa' ? 'empresaAtiva' : recurso
    const data = get()[key as keyof AdminState]
    const lastFetched = get()._lastFetched[recurso] || 0
    const agora = Date.now()

    // Cache guard: respeita o TTL tanto para Arrays quanto para Objetos (empresaAtiva)
    const jaTemDados = Array.isArray(data) ? data.length > 0 : !!data
    if (!force && jaTemDados && (agora - lastFetched < CACHE_TTL_MS)) return

    set(state => ({ loadingStates: { ...state.loadingStates, [recurso]: true } }))

    try {
      const endpoint = recurso === 'empresa' ? '/api/admin/empresa' : `/api/${recurso}`
      // cache: 'no-store' garante que a CDN da Vercel nao devolva dado antigo
      const res = await fetch(endpoint, { cache: 'no-store' })
      const result = await res.json()

      set(state => ({
        [key]: Array.isArray(result) ? result : (recurso === 'empresa' ? result : []),
        loadingStates: { ...state.loadingStates, [recurso]: false },
        _lastFetched: { ...state._lastFetched, [recurso]: Date.now() }
      }) as any)
    } catch (err) {
      console.error(`Erro ao carregar ${recurso}:`, err)
      set(state => ({ loadingStates: { ...state.loadingStates, [recurso]: false } }))
    }
  },

  carregarDados: async (force = false) => {
    if (get().carregando && !force) return

    const isPrimeiraVez = get().produtos.length === 0 && get().categorias.length === 0
    if (isPrimeiraVez) set({ carregando: true, erro: null })

    try {
      // ─── FASE 1: O que o usuário vê primeiro (máximo 2 requests simultâneos)
      // Reduzimos os requests paralelos iniciais para não sobrecarregar o pool do Neon
      await Promise.all([
        get().carregarRecurso('produtos', force),
        get().carregarRecurso('categorias', force),
      ])

      set({ carregando: false }) // UI renderiza imediatamente
      mutate('admin-data')

      // ─── FASE 2: Dados de suporte (300ms depois — não bloqueia a UI)
      setTimeout(() => {
        Promise.all([
          get().carregarRecurso('empresa', force),
          get().carregarRecurso('adicionais', force),
          get().carregarPedidos(),
          get().carregarCupons(),
        ])
      }, 300)

      // ─── FASE 3: Raramente usados no fluxo principal (1s depois)
      setTimeout(() => {
        Promise.all([
          get().carregarRecurso('tamanhos', force),
          get().carregarRecurso('sabores', force),
        ])
      }, 1000)

    } catch (erro) {
      set({ carregando: false })
    }
  },

  carregarPedidos: async () => {
    try {
      const res = await fetch('/api/pedidos')
      const pedidos = await res.json()
      set({ pedidos: Array.isArray(pedidos) ? pedidos : [] })
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro)
      set({ pedidos: [] })
    }
  },

  atualizarStatusPedido: async (id, status) => {
    const pedidosAntigos = get().pedidos
    // Optimistic update imediato
    set({ pedidos: pedidosAntigos.map(p => p.id === id ? { ...p, status } : p) })

    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar pedido')
      // Sync silencioso em background
      get().carregarPedidos()
    } catch (erro) {
      set({ pedidos: pedidosAntigos, erro: 'Erro ao atualizar status' })
      throw erro
    }
  },

  // --- CRUD com Optimistic Update + reload cirúrgico (sem carregarDados completo) ---

  adicionarProduto: async (produto: Partial<Produto>) => {
    const produtosAntigos = get().produtos
    const tempId = Math.random().toString(36).substring(7)
    set({ produtos: [...produtosAntigos, { ...produto, id: tempId } as Produto] })

    try {
      console.log('[STORE_ADICIONAR_PRODUTO_PAYLOAD]', produto)
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[STORE_ADICIONAR_PRODUTO_ERROR]', res.status, errorData)
        throw new Error(errorData.erro || 'Erro ao salvar')
      }
      // Reload só de produtos (cirúrgico)
      await get().carregarRecurso('produtos', true)
    } catch (erro) {
      set({ produtos: produtosAntigos })
      throw erro
    }
  },

  editarProduto: async (id: string, dados: Partial<Produto>) => {
    const produtosAntigos = get().produtos
    set({ produtos: produtosAntigos.map(p => p.id === id ? { ...p, ...dados } : p) })

    try {
      const res = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.erro || 'Erro ao atualizar produto')
      }
      await get().carregarRecurso('produtos', true)
    } catch (erro) {
      set({ produtos: produtosAntigos })
      throw erro
    }
  },

  excluirProduto: async (id: string) => {
    const produtosAntigos = get().produtos
    set({ produtos: produtosAntigos.filter(p => p.id !== id) })

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      get().carregarRecurso('produtos', true)
    } catch (erro) {
      set({ produtos: produtosAntigos })
      throw erro
    }
  },

  adicionarCategoria: async (dados) => {
    const categoriasAntigas = get().categorias
    const tempId = Math.random().toString(36).substring(7)
    set({ categorias: [...categoriasAntigas, { ...dados, id: tempId } as Categoria] })

    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.erro || 'Erro ao criar categoria')
      }
      await get().carregarRecurso('categorias', true)
    } catch (erro) {
      set({ categorias: categoriasAntigas })
      throw erro
    }
  },

  editarCategoria: async (id, dados) => {
    const categoriasAntigas = get().categorias
    set({ categorias: categoriasAntigas.map(c => c.id === id ? { ...c, ...dados } : c) })

    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.erro || 'Erro ao atualizar categoria')
      }
      get().carregarRecurso('categorias', true)
    } catch (erro) {
      set({ categorias: categoriasAntigas })
      throw erro
    }
  },

  excluirCategoria: async (id) => {
    const categoriasAntigas = get().categorias
    set({ categorias: categoriasAntigas.filter(c => c.id !== id) })

    try {
      const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      get().carregarRecurso('categorias', true)
    } catch (erro) {
      set({ categorias: categoriasAntigas })
      throw erro
    }
  },

  limparPedidos: async () => {
    const pedidosAntigos = get().pedidos
    set({ pedidos: [] })
    try {
      const res = await fetch('/api/pedidos', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      get().carregarPedidos()
    } catch (erro) {
      set({ pedidos: pedidosAntigos })
      toast.error('Erro ao limpar pedidos')
    }
  },

  carregarCupons: async () => {
    try {
      const res = await fetch('/api/cupons')
      const data = await res.json()
      set({ cupons: Array.isArray(data) ? data : [] })
    } catch (erro) {
      set({ cupons: [] })
    }
  },

  adicionarCupom: async (dados) => {
    const cuponsAntigos = get().cupons
    const tempId = Math.random().toString(36).substring(7)
    set({ cupons: [...cuponsAntigos, { ...dados, id: tempId } as Cupom] })

    try {
      const res = await fetch('/api/cupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) throw new Error()
      await get().carregarCupons()
    } catch (erro) {
      set({ cupons: cuponsAntigos })
      throw erro
    }
  },

  editarCupom: async (id, dados) => {
    const cuponsAntigos = get().cupons
    set({ cupons: cuponsAntigos.map(c => c.id === id ? { ...c, ...dados } : c) })

    try {
      const res = await fetch(`/api/cupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) throw new Error()
      get().carregarCupons()
    } catch (erro) {
      set({ cupons: cuponsAntigos })
      throw erro
    }
  },

  excluirCupom: async (id) => {
    const cuponsAntigos = get().cupons
    set({ cupons: cuponsAntigos.filter(c => c.id !== id) })

    try {
      const res = await fetch(`/api/cupons/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      get().carregarCupons()
    } catch (erro) {
      set({ cupons: cuponsAntigos })
      throw erro
    }
  },

  adicionarTamanho: async (dados) => {
    const antigos = get().tamanhos
    set({ tamanhos: [...antigos, { ...dados, id: Math.random().toString() } as Tamanho] })

    try {
      const res = await fetch('/api/tamanhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) throw new Error()
      await get().carregarRecurso('tamanhos', true)
    } catch (erro) {
      set({ tamanhos: antigos })
      throw erro
    }
  },

  excluirTamanho: async (id) => {
    const antigos = get().tamanhos
    set({ tamanhos: antigos.filter(t => t.id !== id) })

    try {
      const res = await fetch(`/api/tamanhos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      get().carregarRecurso('tamanhos', true)
    } catch (erro) {
      set({ tamanhos: antigos })
      throw erro
    }
  },

  adicionarSabor: async (dados) => {
    const antigos = get().sabores
    set({ sabores: [...antigos, { ...dados, id: Math.random().toString() } as Sabor] })

    try {
      const res = await fetch('/api/sabores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) throw new Error()
      await get().carregarRecurso('sabores', true)
    } catch (erro) {
      set({ sabores: antigos })
      throw erro
    }
  },

  excluirSabor: async (id) => {
    const antigos = get().sabores
    set({ sabores: antigos.filter(s => s.id !== id) })

    try {
      const res = await fetch(`/api/sabores/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      get().carregarRecurso('sabores', true)
    } catch (erro) {
      set({ sabores: antigos })
      throw erro
    }
  },

  adicionarAdicional: async (dados) => {
    const antigos = get().adicionais
    set({ adicionais: [...antigos, { ...dados, id: Math.random().toString() } as Adicional] })

    try {
      const res = await fetch('/api/adicionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) throw new Error()
      await get().carregarRecurso('adicionais', true)
    } catch (erro) {
      set({ adicionais: antigos })
      throw erro
    }
  },

  editarAdicional: async (id, dados) => {
    const antigos = get().adicionais
    set({ adicionais: antigos.map(a => a.id === id ? { ...a, ...dados } : a) })

    try {
      const res = await fetch(`/api/adicionais/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      if (!res.ok) throw new Error()
      get().carregarRecurso('adicionais', true)
    } catch (erro) {
      set({ adicionais: antigos })
      throw erro
    }
  },

  excluirAdicional: async (id) => {
    const antigos = get().adicionais
    set({ adicionais: antigos.filter(a => a.id !== id) })

    try {
      const res = await fetch(`/api/adicionais/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      get().carregarRecurso('adicionais', true)
    } catch (erro) {
      set({ adicionais: antigos })
      throw erro
    }
  },
}))
