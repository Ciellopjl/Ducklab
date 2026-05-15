'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Copy, MessageCircle, AlertCircle, QrCode, Clock, XCircle, ArrowLeft, Heart, Home, Star } from 'lucide-react'
import { formatarPreco, gerarMensagemWhatsApp, gerarUrlWhatsApp } from '@/lib/utils'
import { gerarPayloadPix } from '@/lib/pix'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function PixClient({ pedido, chavePix }: { pedido: any, chavePix: string }) {
  const router = useRouter()
  const [copiado, setCopiado] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [timeLeft, setTimeLeft] = useState(600)
  const [payloadDinamico, setPayloadDinamico] = useState('')
  const [comprovanteEnviado, setComprovanteEnviado] = useState(false)

  useEffect(() => {
    const total = pedido.totalFinal || pedido.total
    const payload = gerarPayloadPix(total)
    setPayloadDinamico(payload)
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`)
  }, [pedido])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // ✅ Detecta quando o cliente volta do WhatsApp para mostrar tela de agradecimento
  useEffect(() => {
    if (!comprovanteEnviado) return

    const handleVisibilityChange = () => {
      // Quando a aba volta ao foco (usuário retornou do WhatsApp)
      if (document.visibilityState === 'visible') {
        // Estado já está como comprovanteEnviado=true, tela de agradecimento já aparece
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [comprovanteEnviado])

  const minutos = Math.floor(timeLeft / 60)
  const segundos = timeLeft % 60
  const tempoFormatado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  const expirado = timeLeft === 0

  const handleCopiarChave = () => {
    if (expirado) return
    navigator.clipboard.writeText(payloadDinamico)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  const handleJaPaguei = () => {
    if (expirado) return
    const itensParsados = typeof pedido.itens === 'string' ? JSON.parse(pedido.itens) : pedido.itens

    const mensagem = gerarMensagemWhatsApp({
      serial: pedido.serial,
      nomeCliente: pedido.nomeCliente,
      telefone: pedido.telefone,
      endereco: pedido.endereco,
      bairro: pedido.bairro,
      formaPagamento: 'pix',
      observacoes: pedido.observacoes,
      itens: itensParsados,
      total: pedido.total,
      taxaEntrega: pedido.empresa?.taxaEntrega || 0,
      desconto: pedido.desconto || 0,
      totalFinal: pedido.totalFinal,
      comprovantePix: true
    })

    const numeroWhatsApp = pedido.empresa?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || '5582999999999'
    const url = gerarUrlWhatsApp(numeroWhatsApp, mensagem)

    // Marca que o comprovante foi enviado ANTES de abrir o WhatsApp
    setComprovanteEnviado(true)
    window.open(url, '_blank')
  }

  // ─── Tela de Agradecimento ────────────────────────────────────────────────
  if (comprovanteEnviado) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
        <AnimatePresence>
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center relative overflow-hidden text-center"
          >
            {/* Barra superior verde */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-green-400 to-green-600" />


            {/* Ícone animado */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mb-6 mt-2"
            >
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h1 className="text-3xl font-display font-black tracking-tight uppercase mb-3">
                Obrigado,{' '}
                <span className="text-green-400">
                  {pedido.nomeCliente?.split(' ')[0]}!
                </span>
              </h1>

              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                Recebemos seu comprovante pelo WhatsApp. 🎉
              </p>
              <p className="text-gray-500 text-xs leading-relaxed mb-8">
                Seu pedido será confirmado em instantes e você receberá uma atualização em breve. 
              </p>

              {/* Resumo do pedido */}
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 mb-8 text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Pedido</span>
                  <span className="text-xs font-black text-orange-500">#{pedido.serial || pedido.id?.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Pago</span>
                  <span className="text-sm font-black text-white">{formatarPreco(pedido.totalFinal || pedido.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Pagamento</span>
                  <span className="text-xs font-black text-green-400">PIX ✓</span>
                </div>
              </div>

              {/* Botões */}
              <div className="w-full space-y-3">
                <button
                  onClick={() => router.push(`/${pedido.empresa?.slug || ''}`)}
                  className="w-full flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  <Home className="w-5 h-5" />
                  Voltar ao Cardápio
                </button>

                
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ─── Tela de Pagamento PIX (Normal) ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans relative">
      <button
        onClick={() => router.push(`/${pedido.empresa?.slug || ''}`)}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Início
      </button>

      <div className="max-w-md w-full glass-card p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${expirado ? 'from-red-600 via-red-500 to-red-600' : 'from-orange-600 via-orange-400 to-orange-600'}`} />

        <div className={`w-16 h-16 rounded-full ${expirado ? 'bg-red-500/10' : 'bg-orange-500/10'} flex items-center justify-center mb-4 mt-2 transition-colors`}>
          {expirado ? <XCircle className="w-8 h-8 text-red-500" /> : <QrCode className="w-8 h-8 text-orange-500" />}
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight mb-2 uppercase text-center">
          {expirado ? 'Pagamento Expirado' : 'Pagamento PIX'}
        </h1>

        <p className="text-gray-400 text-xs md:text-sm text-center mb-6 px-4 leading-relaxed">
          {expirado
            ? 'O tempo para pagamento via PIX expirou. Por favor, faça um novo pedido.'
            : 'Abra o app do seu banco e escaneie o QR Code abaixo para finalizar o pedido.'}
        </p>

        {!expirado && (
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full mb-6 border border-orange-500/20">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-mono font-bold tracking-wider">{tempoFormatado}</span>
          </div>
        )}

        <div className={`bg-white p-4 rounded-3xl mb-6 transition-all duration-500 ${expirado ? 'opacity-20 grayscale scale-95' : 'shadow-[0_0_40px_rgba(255,77,0,0.15)] hover:scale-105'}`}>
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 md:w-56 md:h-56" />
          ) : (
            <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-200 animate-pulse rounded-xl" />
          )}
        </div>

        <div className="text-center mb-8 w-full">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Total a pagar</p>
          <div className={`py-3 rounded-2xl border ${expirado ? 'bg-white/5 border-white/10' : 'bg-orange-500/10 border-orange-500/20'}`}>
            <p className={`text-3xl md:text-4xl font-display font-black tracking-tighter ${expirado ? 'text-gray-500' : 'text-orange-500'}`}>
              {formatarPreco(pedido.totalFinal || pedido.total)}
            </p>
          </div>
        </div>

        <div className="w-full space-y-2.5 md:space-y-3">
          <button
            onClick={handleCopiarChave}
            disabled={expirado}
            className={`w-full flex items-center justify-center gap-2 border p-3 md:p-5 rounded-2xl transition-all duration-300 font-black text-[9px] md:text-sm tracking-widest uppercase ${
              expirado
                ? 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/5 hover:bg-white/10 border-white/10 active:scale-95'
            }`}
          >
            {copiado ? (
              <>
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="text-green-500">CHAVE COPIADA!</span>
              </>
            ) : (
              <>
                <Copy className={`w-3.5 h-3.5 md:w-5 md:h-5 ${expirado ? 'text-gray-600' : 'text-gray-400'}`} />
                <span className={expirado ? 'text-gray-600' : 'text-gray-300'}>COPIAR CÓDIGO PIX (COPIA E COLA)</span>
              </>
            )}
          </button>

          {expirado ? (
            <button
              onClick={() => router.push(`/${pedido.empresa?.slug || ''}/cardapio`)}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white p-3.5 md:p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm transition-all border border-white/10 active:scale-95"
            >
              Fazer novo pedido
            </button>
          ) : (
            <button
              onClick={handleJaPaguei}
              className="w-full relative flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white p-3.5 md:p-6 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm transition-all shadow-lg shadow-green-500/20 group overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <svg className="w-4 h-4 md:w-6 md:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>JÁ PAGUEI, ENVIAR COMPROVANTE</span>
            </button>
          )}
        </div>

        {!expirado && (
          <div className="mt-6 md:mt-8 flex items-start gap-3 bg-orange-500/10 p-4 md:p-5 rounded-2xl border border-orange-500/30 shadow-[0_0_20px_rgba(255,77,0,0.05)]">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 animate-pulse" />
            <p className="text-[10px] md:text-xs text-orange-100 leading-relaxed font-bold uppercase tracking-tight">
              Atenção: Seu pedido será confirmado somente após o envio do comprovante pelo WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
