'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Send, Sparkles, ChevronRight } from 'lucide-react'

// ─── Tipos ─────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ─── Etapas do fluxo guiado ────────────────────────────────────────────────
const STEPS = ['Projeto', 'Detalhe', 'Recursos', 'Prazo']

// ─── Opções rápidas por etapa ──────────────────────────────────────────────
const QUICK_OPTIONS: Record<number, string[]> = {
  0: ['Página de destino', 'Site Institucional', 'Comércio eletrônico', 'Design UX/UI'],
  1: ['Para minha empresa', 'Para um cliente', 'Redesign de site existente', 'Projeto do zero'],
  2: ['Integração com sistema', 'E-commerce completo', 'Blog / Conteúdo', 'Redes Sociais + Site'],
  3: ['Urgente (até 7 dias)', 'Em 15 dias', 'Em 30 dias', 'Sem prazo definido'],
}

// ─── Mensagens iniciais por etapa ──────────────────────────────────────────
const STEP_MESSAGES = [
  'Olá! Sou o assistente da **Ducklab**. Que tipo de projeto você tem em mente?',
  'Ótimo! Pode me contar mais detalhes sobre o projeto?',
  'Quais recursos você precisa para o projeto?',
  'Qual é o prazo ideal para a entrega?',
]

// ─── Utilitário: renderizar markdown simples ───────────────────────────────
function renderText(text: string) {
  if (!text) return ''
  return String(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

// ─── Componente de bolinha pulsante ────────────────────────────────────────
function PulsingDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00EB69] opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00EB69]" />
    </span>
  )
}

// ─── Bolhas de "digitando..." ──────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.06] w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#00EB69]"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function DucklabAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [guidedDone, setGuidedDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mensagem inicial quando abre o chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: STEP_MESSAGES[0] }])
    }
  }, [isOpen, messages.length])

  // Auto-scroll para o final
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Foca no input ao abrir
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  // Escuta evento customizado para abrir o chat via botões externos
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-ai-chat', handleOpen)
    return () => window.removeEventListener('open-ai-chat', handleOpen)
  }, [])

  // ── Envia mensagem ──────────────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // Avança etapa do fluxo guiado
    if (!guidedDone) {
      const nextStep = currentStep + 1
      if (nextStep < STEPS.length) {
        setCurrentStep(nextStep)
      } else {
        setGuidedDone(true)
      }
    }

    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1] || ''

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': decodeURIComponent(csrfToken)
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro na resposta')
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
    } catch (error: any) {
      const errorMsg = error?.message === 'API key não configurada' 
        ? '⚠️ Ocorreu um erro: A chave da API do Groq (GROQ_API_KEY) não está configurada no arquivo .env!'
        : 'Ops! Tive um problema de conexão. Tente novamente 😅'
        
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMsg },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // ── Seleciona opção rápida ──────────────────────────────────────────────
  function handleQuickOption(option: string) {
    sendMessage(option)
  }

  const quickOptions = !guidedDone ? QUICK_OPTIONS[currentStep] : []
  const isLastUserMessage = messages[messages.length - 1]?.role === 'user'

  return (
    <>
      {/* ── Botão flutuante ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9998] flex items-center justify-center w-14 h-14 rounded-full
                       bg-[#0a0f0a] border border-[#00EB69]/30 shadow-[0_0_30px_rgba(0,235,105,0.2)]
                       hover:shadow-[0_0_45px_rgba(0,235,105,0.4)] hover:border-[#00EB69]/60
                       transition-all duration-300 group"
            aria-label="Abrir chat IA"
          >
            {/* Anel pulsante */}
            <span className="absolute inset-0 rounded-full border border-[#00EB69]/20 animate-ping" />
            {/* Logo */}
            <span className="relative w-8 h-8">
              <Image src="/logo-duck.png" alt="Ducklab IA" fill className="object-contain" />
            </span>
            {/* Bolinha verde */}
            <span className="absolute bottom-0.5 right-0.5">
              <PulsingDot />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Modal de Chat ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-[9999] w-[90vw] max-w-[420px] flex flex-col
                       rounded-2xl overflow-hidden border border-white/[0.08]
                       bg-[#070d07]/95 backdrop-blur-2xl shadow-2xl shadow-black/60"
            style={{ height: 'min(580px, 80vh)' }}
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] bg-[#0a110a]/80 shrink-0">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative w-9 h-9 rounded-full bg-[#00EB69]/10 border border-[#00EB69]/30 flex items-center justify-center overflow-hidden shrink-0">
                  <Image src="/logo-duck.png" alt="Ducklab IA" fill className="object-contain p-1" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Ducklab IA</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <PulsingDot />
                    <span className="text-[10px] text-[#00EB69] font-medium">Assistente IA · Agora online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setMessages([])
                  setCurrentStep(0)
                  setGuidedDone(false)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5
                           hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Fechar chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Barra de progresso por etapas ──────────────────────────── */}
            <div className="flex items-center gap-0 px-4 py-2.5 border-b border-white/[0.05] bg-[#08100a]/60 shrink-0">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-all duration-300 ${
                    i <= currentStep
                      ? 'text-white'
                      : 'text-zinc-600'
                  }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300 ${
                      i < currentStep
                        ? 'bg-[#00EB69] text-black'
                        : i === currentStep
                        ? 'bg-[#00EB69]/20 border border-[#00EB69] text-[#00EB69]'
                        : 'bg-white/5 border border-white/10 text-zinc-600'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </span>
                    {step}
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight size={12} className={`mx-0.5 ${i < currentStep ? 'text-[#00EB69]' : 'text-zinc-700'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Área de mensagens ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {/* Avatar IA */}
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-[#00EB69]/10 border border-[#00EB69]/30 flex items-center justify-center overflow-hidden shrink-0 mb-0.5">
                      <div className="relative w-4 h-4">
                        <Image src="/logo-duck.png" alt="IA" fill className="object-contain" />
                      </div>
                    </div>
                  )}
                  {/* Balão */}
                  <div
                    className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#00EB69]/15 border border-[#00EB69]/20 text-white rounded-tr-sm'
                        : 'bg-white/[0.06] border border-white/[0.07] text-gray-100 rounded-tl-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
                  />
                </motion.div>
              ))}

              {/* Digitando... */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[#00EB69]/10 border border-[#00EB69]/30 flex items-center justify-center overflow-hidden shrink-0">
                    <div className="relative w-4 h-4">
                      <Image src="/logo-duck.png" alt="IA" fill className="object-contain" />
                    </div>
                  </div>
                  <TypingIndicator />
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Botões de opção rápida ─────────────────────────────────── */}
            <AnimatePresence>
              {quickOptions.length > 0 && !isLoading && !isLastUserMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-3 flex flex-wrap gap-2 border-t border-white/[0.05] pt-3 shrink-0"
                >
                  {quickOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleQuickOption(opt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                                 border border-[#00EB69]/25 bg-[#00EB69]/5 text-[#00EB69]
                                 hover:bg-[#00EB69]/15 hover:border-[#00EB69]/50
                                 transition-all duration-200"
                    >
                      <ChevronRight size={11} />
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input de texto ou Botão Final ───────────────────────────── */}
            <div className="px-4 py-3 border-t border-white/[0.07] bg-[#0a110a]/60 shrink-0">
              {guidedDone && !isLoading ? (
                <a
                  href="https://wa.me/558799614464"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#00EB69] px-4 py-3.5 text-[15px] font-black text-[#050f05] transition-all hover:bg-[#00EB69]/90 hover:scale-[0.98] shadow-[0_0_20px_rgba(0,235,105,0.2)]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.855L.057 23.5a.5.5 0 00.61.61l5.763-1.47A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.092-1.395l-.364-.217-3.773.963.98-3.68-.236-.376A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Falar diretamente com a Ducklab
                </a>
              ) : quickOptions.length > 0 && !isLoading && !isLastUserMessage ? (
                <p className="text-center text-[11px] text-zinc-500 py-1">
                  Selecione uma opção acima para continuar
                </p>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl
                               px-4 py-2.5 text-sm text-white placeholder-zinc-600
                               focus:outline-none focus:border-[#00EB69]/40 focus:bg-white/[0.08]
                               transition-all duration-200 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-[#00EB69]/15 border border-[#00EB69]/30
                               hover:bg-[#00EB69]/30 hover:border-[#00EB69]/60
                               flex items-center justify-center text-[#00EB69]
                               transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                               active:scale-95"
                    aria-label="Enviar"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
