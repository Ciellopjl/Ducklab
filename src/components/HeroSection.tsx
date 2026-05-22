'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock } from 'lucide-react'
import { useTenant } from '@/components/TenantProvider'
import { isStoreOpen } from '@/lib/storeStatus'

const DOTS = [
  { id: 1, left: '8%', top: '20%', delay: '0s', size: 3, dur: '4s' },
  { id: 2, left: '15%', top: '60%', delay: '1s', size: 2, dur: '3s' },
  { id: 3, left: '88%', top: '25%', delay: '0.5s', size: 4, dur: '5s' },
  { id: 4, left: '50%', top: '5%', delay: '1.2s', size: 2, dur: '3.5s' },
]

export default function HeroSection() {
  const empresa = useTenant()
  const [mounted, setMounted] = useState(false)
  const [aberto, setAberto] = useState<boolean | null>(null)

  useEffect(() => {
    setMounted(true)
    // Forçamos a verificação de status sempre que os dados mudarem
    const status = isStoreOpen(
      empresa.horarioAbertura ?? '18:00', 
      empresa.horarioFechamento ?? '23:00',
      empresa.diasAbertos ?? "0,1,2,3,4,5,6"
    )
    setAberto(status)
  }, [empresa.horarioAbertura, empresa.horarioFechamento, empresa.diasAbertos])

  const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
  // Lógica robusta de parsing: remove espaços e ignora itens vazios
  const diasAbertosIndices = (empresa.diasAbertos || '0,1,2,3,4,5,6')
    .split(',')
    .filter(d => d.trim() !== '')
    .map(Number)

  const hoje = mounted ? new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"})) : new Date()
  const diaAtualIndex = hoje.getDay()

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]" style={{ transform: 'translate3d(0,0,0)' }}>
      
      {/* ── FUNDO: ELEMENTOS VISUAIS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Safari Fix: Fewer particles on mobile */}
        {[8, 42, 72, 95].map((left, i) => (
          <div key={i} className="absolute w-1 h-1 bg-orange-500 rounded-full blur-[1px] animate-ember"
            style={{
              left: `${left}%`,
              bottom: '-5%',
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4 + (i % 3)}s`,
              '--drift': `${(i % 2 === 0 ? 30 : -30)}px`
            } as any}
          />
        ))}

        <div className="animate-glow absolute right-[-10%] top-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full opacity-20 md:opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(255,77,0,0.15) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate3d(0,0,0)' }}
        />
        
        {DOTS.map(d => (
          <div key={d.id} className="absolute rounded-full animate-pulse"
            style={{
              left: d.left, top: d.top, width: d.size, height: d.size,
              background: '#FF4D00',
              opacity: 0.15,
              animationDuration: d.dur,
              animationDelay: d.delay,
              transform: 'translate3d(0,0,0)'
            }}
          />
        ))}
      </div>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 w-full" style={{ transform: 'translate3d(0,0,0)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[100svh] py-20 md:py-28">

          {/* COLUNA ESQUERDA — TEXTO */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 will-change-transform">

            {/* Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 mb-4 md:mb-6">
              {mounted && aberto !== null && (
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-500 ${aberto ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'}`}>
                  <div className={`w-1 h-1 rounded-full ${aberto ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {aberto ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
              )}
              {empresa.endereco && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  <MapPin className="w-2.5 h-2.5 text-gray-400" />
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider truncate max-w-[150px]">{empresa.endereco}</span>
                </div>
              )}
            </div>

            {/* Calendário compacto */}
            {mounted && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 shadow-sm">
                {diasSemana.map((dia, index) => (
                  <div key={dia} className={`flex flex-col items-center gap-1 w-9 ${index === diaAtualIndex ? 'bg-orange-500/10 rounded-lg py-1.5 px-1' : ''}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wide ${index === diaAtualIndex ? 'text-white' : 'text-white/30'}`}>
                      {dia}
                    </span>
                    <div className={`w-2 h-2 rounded-full shadow-sm transition-all duration-500 ${diasAbertosIndices.includes(index) ? 'bg-green-500 shadow-green-500/50' : 'bg-white/10'}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Título */}
            <div className="mb-6 w-full animate-text-up">
              <h1 className="font-display flex flex-col items-center lg:items-start leading-[0.9] py-2">
                <span className="text-[1.3rem] sm:text-[1.8rem] md:text-[2.8rem] lg:text-[3.5rem] font-bold uppercase tracking-[0.2em] text-orange-500 mb-1">
                  Agência Criativa
                </span>
                <span className="text-[2.8rem] sm:text-[3.5rem] md:text-[5.5rem] lg:text-[7.5rem] font-black italic tracking-tight text-white uppercase break-words text-center lg:text-left">
                  {empresa.nome}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-2 opacity-40">
                <div className="flex-1 h-px bg-orange-500" />
                <span className="text-[8px] text-gray-500 uppercase tracking-[0.3em]">Premium Delivery</span>
                <div className="flex-1 h-px bg-orange-500" />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA — LOGO */}
          <div className="flex justify-center items-center order-1 lg:order-2 relative">
            <div className="relative animate-burger will-change-transform">
              {/* Brilho */}
              <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-[20px] animate-pulse" />
              
              {/* Container da Logo */}
              <div className="w-44 h-44 sm:w-64 sm:h-64 md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden border-[4px] md:border-[6px] border-orange-600 shadow-[0_0_30px_rgba(255,77,0,0.4)] flex items-center justify-center bg-black p-4 relative z-10">
                <img
                  src="/logo-duck.png"
                  alt={empresa.nome}
                  className="w-[85%] h-[85%] object-contain"
                  style={{ transform: 'translate3d(0,0,0)' }}
                />
              </div>

              {/* Badges Flutuantes */}
              <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/90 border border-orange-500/30 z-20">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-[9px] font-black">4.9</span>
              </div>
              <div className="absolute -bottom-2 -left-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/90 border border-orange-500/30 z-20">
                <Clock className="w-2.5 h-2.5 text-orange-500" />
                <span className="text-white text-[9px] font-black uppercase">Rápido</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 z-20 pointer-events-none bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  )
}
