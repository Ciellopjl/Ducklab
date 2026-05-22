'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrinhoStore } from '@/store/cartStore'
import Script from 'next/script'
import { formatarPreco, gerarMensagemWhatsApp, gerarUrlWhatsApp } from '@/lib/utils'
import { isStoreOpen } from '@/lib/storeStatus'
import Header from '@/components/Header'
import CartSidebar from '@/components/CartSidebar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Building,
  CreditCard,
  DollarSign,
  QrCode,
  Send,
  ShoppingBag,
  MessageCircle,
  Ticket,
  Tag,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useTenant } from '@/components/TenantProvider'

export default function CheckoutPage() {
  const empresa = useTenant()
  const router = useRouter()
  const { itens, total, limparCarrinho } = useCarrinhoStore()
  const [lojaAberta, setLojaAberta] = useState(true)

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

  // Helper para ler cookies do navegador
  const getCookie = (name: string): string => {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
    return ''
  }

  useEffect(() => {
    setLojaAberta(isStoreOpen(empresa.horarioAbertura ?? undefined, empresa.horarioFechamento ?? undefined))
  }, [empresa])

  const [formData, setFormData] = useState({
    nomeCliente: '',
    telefone: '',
    endereco: '',
    bairro: '',
    formaPagamento: '' as 'pix' | 'dinheiro' | 'cartao' | '',
    trocoParaValor: '',
    observacoes: '',
  })

  const [enviando, setEnviando] = useState(false)
  
  // Estados do Cupom
  const [cupomCodigo, setCupomCodigo] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState<any>(null)
  const [validandoCupom, setValidandoCupom] = useState(false)
  const [erroCupom, setErroCupom] = useState('')

  const handleValidarCupom = async () => {
    if (!cupomCodigo) return
    
    setValidandoCupom(true)
    setErroCupom('')
    
    try {
      const res = await fetch('/api/cupons/validar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-csrf-token': getCookie('csrf_token')
        },
        body: JSON.stringify({
          empresaId: empresa.id,
          codigo: cupomCodigo,
          totalPedido: total()
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setCupomAplicado(data.cupom)
      } else {
        setErroCupom(data.erro)
      }
    } catch (erro) {
      setErroCupom('Erro ao validar cupom')
    } finally {
      setValidandoCupom(false)
    }
  }

  const handleRemoverCupom = () => {
    setCupomAplicado(null)
    setCupomCodigo('')
    setErroCupom('')
  }

  const calcularTotalFinal = () => {
    const subtotal = total()
    const taxa = empresa.taxaEntrega || 0
    const subtotalComTaxa = subtotal + taxa
    if (!cupomAplicado) return subtotalComTaxa
    return Math.max(0, subtotalComTaxa - cupomAplicado.descontoAplicado)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value
    
    if (e.target.name === 'telefone') {
      value = value.replace(/\D/g, '')
      if (value.length > 11) value = value.slice(0, 11)
      
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2')
      } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2}).*/, '($1')
      }
    }
    
    setFormData({ ...formData, [e.target.name]: value })
  }

  const formValido =
    formData.nomeCliente.trim() &&
    formData.telefone.trim() &&
    formData.endereco.trim() &&
    formData.bairro.trim() &&
    formData.formaPagamento &&
    itens.length > 0

  const handleEnviarPedido = async () => {
    if (!formValido || !lojaAberta) return

    setEnviando(true)

    // Executa reCAPTCHA antes do envio
    let recaptchaToken = ''
    if (siteKey && !siteKey.startsWith('SUBSTITUA-')) {
      try {
        // @ts-ignore
        if (window.grecaptcha) {
          // @ts-ignore
          recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'criar_pedido' })
        }
      } catch (err) {
        console.error('[RECAPTCHA_ERROR]:', err)
      }
    }

    const idempotencyKey = crypto.randomUUID()
    const csrfToken = getCookie('csrf_token')

    let serialGerado = '0000'
    let pedidoId = ''
    try {
      // Salvar pedido na API
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-csrf-token': csrfToken,
          'x-idempotency-key': idempotencyKey
        },
        body: JSON.stringify({
          empresaId: empresa.id,
          ...formData,
          recaptchaToken,
          itens: itens.map((item) => ({
            produtoId: item.produto.id,
            nome: item.produto.nome,
            quantidade: item.quantidade,
            preco: item.precoUnitario,
            tamanho: item.tamanho?.nome || null,
            sabores: item.sabores?.map(s => s.nome) || [],
            adicionais: item.adicionais?.map(a => a.nome) || [],
            observacoes: item.observacoes || null,
          })),
          total: total(),
          taxaEntrega: empresa.taxaEntrega || 0,
          cupomCodigo: cupomAplicado?.codigo || null,
          desconto: cupomAplicado?.descontoAplicado || 0,
          totalFinal: calcularTotalFinal(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        serialGerado = data.serial || '0000'
        pedidoId = data.id
      }
    } catch (erro) {
      console.error('Erro ao salvar pedido:', erro)
    }

    if (formData.formaPagamento === 'pix' && pedidoId) {
      // Limpar carrinho e redirecionar para tela de PIX
      limparCarrinho()
      setEnviando(false)
      router.push(`/${empresa.slug}/pedido/${pedidoId}/pix`)
      return
    }

    // Gerar mensagem WhatsApp para dinheiro/cartão
    const mensagem = gerarMensagemWhatsApp({
      serial: serialGerado,
      nomeCliente: formData.nomeCliente,
      telefone: formData.telefone,
      endereco: formData.endereco,
      bairro: formData.bairro,
      formaPagamento: formData.formaPagamento,
      trocoParaValor: formData.trocoParaValor || undefined,
      observacoes: formData.observacoes || undefined,
      itens: itens.map((item) => ({
        nome: item.produto.nome,
        quantidade: item.quantidade,
        preco: item.precoUnitario,
        tamanho: item.tamanho?.nome,
        sabores: item.sabores?.map(s => s.nome),
        adicionais: item.adicionais?.map(a => a.nome),
        observacoes: item.observacoes,
      })),
      total: total(),
      taxaEntrega: empresa.taxaEntrega || 0,
      desconto: cupomAplicado?.descontoAplicado || 0,
      totalFinal: calcularTotalFinal(),
    })

    const numeroWhatsApp =
      empresa.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || '5582999999999'
    const url = gerarUrlWhatsApp(numeroWhatsApp, mensagem)

    // Abrir WhatsApp
    window.open(url, '_blank')

    // Limpar carrinho
    limparCarrinho()
    setEnviando(false)
  }

  const formasPagamento = [
    { valor: 'pix', label: 'PIX', icone: <QrCode className="w-5 h-5" /> },
    {
      valor: 'dinheiro',
      label: 'Dinheiro',
      icone: <DollarSign className="w-5 h-5" />,
    },
    {
      valor: 'cartao',
      label: 'Cartão',
      icone: <CreditCard className="w-5 h-5" />,
    },
  ]

  // Se carrinho está vazio
  if (itens.length === 0) {
    return (
      <>
        <Header />
        <CartSidebar />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingBag className="w-20 h-20 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold mb-3">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-500 mb-8">
              Adicione itens do cardápio para fazer seu pedido
            </p>
            <Link href={`/${empresa.slug}/cardapio`} className="btn-primary">
              Ver Cardápio
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <CartSidebar />
      <main className="min-h-screen pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 
                         text-gray-300 hover:text-orange-400 hover:bg-white/10 hover:border-orange-500/50
                         transition-all duration-300 text-xs md:text-sm mb-4 md:mb-6 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-2xl md:text-4xl font-display font-bold leading-tight">
              Finalizar <span className="text-gradient">Pedido</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados pessoais */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Dados para Entrega
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Nome completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        name="nomeCliente"
                        value={formData.nomeCliente}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                                   text-white placeholder-gray-600 focus:border-orange-500/50 
                                   focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(82) 9 9999-9999"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                                   text-white placeholder-gray-600 focus:border-orange-500/50 
                                   focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Endereço (Rua e Número) *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleChange}
                        placeholder="Rua, número"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                                   text-white placeholder-gray-600 focus:border-orange-500/50 
                                   focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Bairro *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="Bairro"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                                   text-white placeholder-gray-600 focus:border-orange-500/50 
                                   focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Observações (opcional)
                  </label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Ex: sem cebola, ponto da carne, etc."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4
                               text-white placeholder-gray-600 focus:border-orange-500/50 
                               focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all
                               resize-none"
                  />
                </div>
              </div>

              {/* Forma de pagamento */}
              <div className="glass-card p-5 md:p-8">
                <h2 className="text-base md:text-xl font-display font-black mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  Pagamento
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {formasPagamento.map((forma) => (
                    <button
                      key={forma.valor}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          formaPagamento: forma.valor as 'pix' | 'dinheiro' | 'cartao',
                        })
                      }
                      className={`flex items-center sm:flex-col justify-start sm:justify-center gap-4 sm:gap-3 p-4 md:p-6 rounded-2xl border-2 
                                 transition-all duration-300 relative overflow-hidden group
                                 ${
                                   formData.formaPagamento === forma.valor
                                     ? 'bg-orange-600/10 border-orange-500 text-white shadow-lg shadow-orange-500/10 scale-[1.02]'
                                     : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                 }`}
                    >
                      {formData.formaPagamento === forma.valor && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                        </div>
                      )}
                      <div className={`p-3 rounded-xl transition-colors ${
                        formData.formaPagamento === forma.valor ? 'bg-orange-500 text-black' : 'bg-white/5 text-gray-400 group-hover:text-white'
                      }`}>
                        {forma.icone}
                      </div>
                      <div className="flex flex-col sm:items-center">
                        <span className="text-sm md:text-base font-bold uppercase tracking-tight">{forma.label}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest hidden sm:block">Selecionar</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Troco para (quando dinheiro) */}
                <AnimatePresence>
                  {formData.formaPagamento === 'dinheiro' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      <label className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        Troco para quanto?
                      </label>
                      <input
                        type="text"
                        name="trocoParaValor"
                        value={formData.trocoParaValor}
                        onChange={handleChange}
                        placeholder="Ex: 50,00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6
                                   text-white placeholder-gray-600 focus:border-orange-500/50 
                                   focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-mono"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-28">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Resumo do Pedido
                </h2>

                {/* Itens */}
                <div className="space-y-3 mb-6">
                  {itens.map((item) => (
                    <div
                      key={item.produto.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-300">
                        {item.quantidade}x {item.produto.nome}
                      </span>
                      <span className="text-gray-400">
                        {formatarPreco(item.produto.preco * item.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 pt-4 mb-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-gray-200 font-medium">
                      {formatarPreco(total())}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Taxa de Entrega</span>
                    <span className="text-gray-200 font-medium">
                      {formatarPreco(empresa.taxaEntrega || 0)}
                    </span>
                  </div>

                  {cupomAplicado && (
                    <div className="flex items-center justify-between text-sm text-green-500">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Desconto ({cupomAplicado.codigo})
                      </span>
                      <span>-{formatarPreco(cupomAplicado.descontoAplicado)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs md:text-gray-200 font-bold">Total</span>
                    <span className="text-xl md:text-2xl font-display font-bold text-gradient">
                      {formatarPreco(calcularTotalFinal())}
                    </span>
                  </div>
                </div>

                {/* Cupom de Desconto */}
                <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Ticket className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-white uppercase tracking-tighter">Cupom de Desconto</span>
                  </div>

                  {cupomAplicado ? (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-bold text-green-500">{cupomAplicado.codigo}</span>
                      </div>
                      <button 
                        onClick={handleRemoverCupom}
                        className="p-1 hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-green-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative flex items-stretch h-12">
                        <input
                          type="text"
                          placeholder="Código do cupom"
                          value={cupomCodigo}
                          onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())}
                          className="w-full h-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-[88px] text-sm text-white outline-none focus:border-orange-500 transition-all font-mono uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                        />
                        <button
                          onClick={handleValidarCupom}
                          disabled={!cupomCodigo || validandoCupom}
                          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 md:px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-lg text-[10px] font-black tracking-widest transition-all uppercase flex items-center justify-center backdrop-blur-sm"
                        >
                          {validandoCupom ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : 'Aplicar'}
                        </button>
                      </div>
                      {erroCupom && (
                        <p className="text-[10px] text-orange-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {erroCupom}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Botão enviar */}
                <div className="mt-8">
                  <button
                    onClick={handleEnviarPedido}
                    disabled={!formValido || enviando || !lojaAberta}
                    className={`relative w-full flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl 
                               font-black uppercase tracking-widest text-xs transition-all duration-500 overflow-hidden group
                               ${
                                 !lojaAberta
                                   ? 'bg-red-600/20 text-red-500 border border-red-500/20 cursor-not-allowed'
                                   : formValido && !enviando
                                   ? (formData.formaPagamento === 'pix' 
                                       ? 'bg-[#FF4D00] hover:bg-[#E64500] text-black shadow-xl shadow-[#FF4D00]/20 hover:-translate-y-1' 
                                       : 'bg-green-500 hover:bg-green-400 text-white shadow-xl shadow-green-500/20 hover:-translate-y-1')
                                   : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                               }`}
                  >
                    {formValido && !enviando && lojaAberta && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    )}
                    
                    {!lojaAberta ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span>LOJA FECHADA</span>
                      </>
                    ) : enviando ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>PROCESSANDO...</span>
                      </>
                    ) : formData.formaPagamento === 'pix' ? (
                      <>
                        <span>FAZER PAGAMENTO</span>
                        <QrCode className="w-5 h-5 text-black" />
                      </>
                    ) : (
                      <>
                        <svg className={`w-6 h-6 ${formValido ? 'text-white' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>{formValido ? 'ENVIAR VIA WHATSAPP' : 'PREENCHA OS DADOS'}</span>
                      </>
                    )}
                  </button>

                  {!formValido && itens.length > 0 && (
                    <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-widest font-bold flex flex-col gap-1 items-center">
                      <AlertCircle className="w-4 h-4 text-orange-500/50" />
                      Preencha o formulário para liberar o pedido
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {siteKey && !siteKey.startsWith('SUBSTITUA-') && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="lazyOnload"
        />
      )}
    </>
  )
}
