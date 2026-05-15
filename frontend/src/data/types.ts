// Tipos TypeScript para o sistema M.E burgue!

export interface Categoria {
  id: string
  nome: string
  label: string
  icone: string
  adicionaisHabilitados: boolean
  produtos?: Produto[]
  sabores?: Sabor[]
}

export interface Tamanho {
  id: string
  nome: string
  sigla?: string | null
  maxSabores: number
  ordem: number
}

export interface ProdutoPreco {
  id?: string
  produtoId?: string
  tamanhoId: string
  preco: number
  tamanho?: Tamanho
}

export interface Sabor {
  id: string
  nome: string
  descricao?: string | null
  imagem?: string | null
  disponivel: boolean
  precoAdicional: number
  categoriaId?: string | null
}

export interface Adicional {
  id: string
  nome: string
  preco: number
  disponivel: boolean
}

export interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number // Preço base ou "a partir de"
  imagem: string
  disponivel: boolean
  badge?: string | null
  categoriaId: string
  categoria?: Categoria
  
  // Campos Pizzaria
  isPizza: boolean
  precos?: ProdutoPreco[]

  // Campos Promoção
  emPromocao?: boolean
  precoPromocional?: number | null
  badgePromocao?: string | null
}

export interface ItemCarrinho {
  produto: Produto
  quantidade: number
  observacoes?: string
  tamanho?: Tamanho
  sabores?: Sabor[]
  adicionais?: Adicional[]
  precoUnitario: number
}

export interface DadosPedido {
  nomeCliente: string
  telefone: string
  endereco: string
  bairro: string
  formaPagamento: 'pix' | 'dinheiro' | 'cartao'
  trocoParaValor?: string
  observacoes?: string
}

export interface Pedido {
  id: string
  nomeCliente: string
  telefone: string
  endereco: string
  bairro: string
  itens: string // JSON string
  total: number
  desconto: number
  totalFinal: number
  formaPagamento: string
  trocoParaValor?: string | null
  observacoes?: string | null
  status: string
  criadoEm: string
}

export interface Promocao {
  id: string
  titulo: string
  descricao: string
  tag: string
  icone: string
  cor: string
  corBorda: string
}

export interface Cupom {
  id: string
  codigo: string
  tipo: 'porcentagem' | 'valor'
  valor: number
  pedidoMinimo: number
  ativo: boolean
  validade?: string | null
}