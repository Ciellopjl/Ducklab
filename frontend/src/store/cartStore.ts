import { create } from 'zustand'
import { ItemCarrinho, Produto } from '@/data/types'

interface CarrinhoState {
  itens: ItemCarrinho[]
  aberto: boolean
  abrirCarrinho: () => void
  fecharCarrinho: () => void
  toggleCarrinho: () => void
  adicionarItem: (item: ItemCarrinho) => void
  removerItem: (index: number) => void
  alterarQuantidade: (index: number, quantidade: number) => void
  limparCarrinho: () => void
  total: () => number
  quantidadeTotal: () => number
}

export const useCarrinhoStore = create<CarrinhoState>((set, get) => ({
  itens: [],
  aberto: false,

  abrirCarrinho: () => set({ aberto: true }),
  fecharCarrinho: () => set({ aberto: false }),
  toggleCarrinho: () => set((state) => ({ aberto: !state.aberto })),

  adicionarItem: (novoItem: ItemCarrinho) => {
    set((state) => {
      // Para pizzas ou itens com variações, comparamos mais do que apenas o ID
      const itemExistenteIndex = state.itens.findIndex((item) => {
        const mesmoProduto = item.produto.id === novoItem.produto.id
        const mesmaObservacao = item.observacoes === novoItem.observacoes
        const mesmoTamanho = item.tamanho?.id === novoItem.tamanho?.id
        
        // Compara sabores (arrays de objetos)
        const mesmosSabores = JSON.stringify(item.sabores) === JSON.stringify(novoItem.sabores)
        
        // Compara adicionais
        const mesmosAdicionais = JSON.stringify(item.adicionais) === JSON.stringify(novoItem.adicionais)

        return mesmoProduto && mesmaObservacao && mesmoTamanho && mesmosSabores && mesmosAdicionais
      })

      if (itemExistenteIndex !== -1) {
        const novosItens = [...state.itens]
        novosItens[itemExistenteIndex].quantidade += novoItem.quantidade
        return { itens: novosItens, aberto: true }
      }

      return {
        itens: [...state.itens, novoItem],
        aberto: true,
      }
    })
  },

  removerItem: (index: number) => {
    set((state) => {
      const novosItens = state.itens.filter((_, i) => i !== index)
      return {
        itens: novosItens,
        aberto: novosItens.length > 0 ? state.aberto : false
      }
    })
  },

  alterarQuantidade: (index: number, quantidade: number) => {
    set((state) => {
      // Se a quantidade for 0 ou menor, removemos o item inline para evitar conflitos de estado
      if (quantidade <= 0) {
        const novosItens = state.itens.filter((_, i) => i !== index)
        return {
          itens: novosItens,
          aberto: novosItens.length > 0 ? state.aberto : false
        }
      }

      // Caso contrário, apenas atualizamos a quantidade
      return {
        itens: state.itens.map((item, i) =>
          i === index ? { ...item, quantidade } : item
        ),
      }
    })
  },

  limparCarrinho: () => set({ itens: [], aberto: false }),

  total: () => {
    const { itens } = get()
    return itens.reduce(
      (total, item) => total + item.precoUnitario * item.quantidade,
      0
    )
  },

  quantidadeTotal: () => {
    const { itens } = get()
    return itens.reduce((total, item) => total + item.quantidade, 0)
  },
}))
