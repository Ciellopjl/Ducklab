/**
 * Formata um valor numérico como preço em Real brasileiro.
 * Ex: 25.90 => "R$ 25,90"
 */
export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Gera a mensagem formatada para envio via WhatsApp.
 */
export function gerarMensagemWhatsApp(pedido: {
  nomeCliente: string
  telefone: string
  endereco: string
  bairro: string
  formaPagamento: string
  trocoParaValor?: string
  observacoes?: string
  itens: Array<{
    nome: string
    quantidade: number
    preco: number
    observacoes?: string
    tamanho?: string
    sabores?: string[]
    adicionais?: string[]
  }>
  total: number
  taxaEntrega?: number
  desconto?: number
  totalFinal?: number
  serial?: string
  comprovantePix?: boolean
}): string {
  const itensTexto = pedido.itens
    .map((item) => {
      let linha = `▸ ${item.quantidade}x ${item.nome}`
      if (item.tamanho) linha += ` (${item.tamanho})`
      linha += ` — ${formatarPreco(item.preco * item.quantidade)}`
      
      if (item.sabores && item.sabores.length > 0) {
        linha += `\n   🍔 _Ingredientes: ${item.sabores.join(', ')}_`
      }
      
      if (item.adicionais && item.adicionais.length > 0) {
        linha += `\n   ➕ _Extras: ${item.adicionais.join(', ')}_`
      }
      
      if (item.observacoes) {
        linha += `\n   ┗ _Obs: ${item.observacoes}_`
      }
      
      return linha
    })
    .join('\n\n')

  const formaPagamentoTexto: Record<string, string> = {
    pix: '💠 PIX',
    dinheiro: '💵 Dinheiro',
    cartao: '💳 Cartão',
  }

  let mensagem = `🦆 *PEDIDO #${pedido.serial || '0000'} — Ducklab* 🦆\n\n`
  mensagem += `👤 *Cliente:* ${pedido.nomeCliente}\n`
  mensagem += `📱 *Telefone:* ${pedido.telefone}\n`
  mensagem += `📍 *Endereço:* ${pedido.endereco}\n`
  mensagem += `🏘️ *Bairro:* ${pedido.bairro}\n\n`
  mensagem += `📋 *ITENS DO PEDIDO:*\n${itensTexto}\n\n`
  
  if (pedido.desconto && pedido.desconto > 0) {
    mensagem += `💰 *Subtotal:* ${formatarPreco(pedido.total)}\n`
    mensagem += `🛵 *Taxa de Entrega:* ${formatarPreco(pedido.taxaEntrega || 0)}\n`
    mensagem += `🎁 *Desconto:* -${formatarPreco(pedido.desconto)}\n`
    mensagem += `💵 *TOTAL: ${formatarPreco(pedido.totalFinal || (pedido.total + (pedido.taxaEntrega || 0) - pedido.desconto))}*\n\n`
  } else {
    mensagem += `💰 *Subtotal:* ${formatarPreco(pedido.total)}\n`
    mensagem += `🛵 *Taxa de Entrega:* ${formatarPreco(pedido.taxaEntrega || 0)}\n`
    mensagem += `💵 *TOTAL: ${formatarPreco(pedido.totalFinal || (pedido.total + (pedido.taxaEntrega || 0)))}*\n\n`
  }

  mensagem += `💳 *Pagamento:* ${formaPagamentoTexto[pedido.formaPagamento] || pedido.formaPagamento}\n`

  if (pedido.formaPagamento === 'dinheiro' && pedido.trocoParaValor) {
    mensagem += `💵 *Troco para:* R$ ${pedido.trocoParaValor}\n`
  }

  if (pedido.observacoes) {
    mensagem += `\n📝 *Observações:* ${pedido.observacoes}\n`
  }

  if (pedido.comprovantePix) {
    mensagem += `\n⚠️ *JÁ REALIZEI O PAGAMENTO VIA PIX*\n`
    mensagem += `📎 *POR FAVOR, VEJA O COMPROVANTE ABAIXO:*`
  }

  mensagem += `\n✅ Pedido realizado pelo site Ducklab!`

  return mensagem
}

/**
 * Formata uma string de telefone para o padrão (XX) X XXXX-XXXX.
 */
export function formatarTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
  } else if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3')
  }
  return telefone
}

/**
 * Gera a URL do WhatsApp com a mensagem do pedido.
 */
export function gerarUrlWhatsApp(numero: string, mensagem: string): string {
  const numeroLimpo = numero.replace(/\D/g, '')
  const mensagemCodificada = encodeURIComponent(mensagem)
  return `https://wa.me/${numeroLimpo}?text=${mensagemCodificada}`
}

// ─── Helpers de Timezone Brasil ─────────────────────────────────────────────

const TZ_BRASIL = 'America/Sao_Paulo'

/**
 * Converte uma Date (UTC) para a data local no fuso de Brasília.
 * Retorna string no formato "YYYY-MM-DD".
 *
 * Evita o bug em que pedidos feitos após 21h no Brasil aparecem
 * no dia seguinte por causa da diferença UTC-3.
 */
export function dateParaBrasilia(date: Date): string {
  return date
    .toLocaleDateString('pt-BR', {
      timeZone: TZ_BRASIL,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    // pt-BR retorna "DD/MM/YYYY" → converter para "YYYY-MM-DD"
    .split('/')
    .reverse()
    .join('-')
}

/**
 * Retorna a data "hoje" no fuso de Brasília como string "YYYY-MM-DD".
 */
export function hojeEmBrasilia(): string {
  return dateParaBrasilia(new Date())
}

/**
 * Retorna o início do dia atual no fuso de Brasília como objeto Date (UTC).
 * Usado para filtros de banco de dados (criadoEm >= inicioDoDia).
 */
export function inicioDoDiaEmBrasilia(): Date {
  // Pegar a data de hoje em Brasília no formato YYYY-MM-DD
  const hoje = hojeEmBrasilia()
  // Interpretar 00:10 de Brasília como UTC (Brasília = UTC-3, então 00:10 BRT = 03:10 UTC)
  return new Date(`${hoje}T03:10:00.000Z`)
}

