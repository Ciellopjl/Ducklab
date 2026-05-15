export type PedidoDemanda = {
  id: string
  horario: string    // "14:00", "14:01", "15:32"
  valor: number      // em reais
  itens: number      // quantidade de itens
}

export type DemandaResponse = {
  pedidos: number        // total do dia
  faturamento: number    // total em R$
  historico: PedidoDemanda[]    // array com cada pedido individual
}
