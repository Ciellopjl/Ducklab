'use client'

import React, { useMemo, memo, useState, useRef, useEffect } from 'react'
import { ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'
import { formatarPreco } from '@/lib/utils'

interface PedidoData {
  id: string
  hora: string
  receita: number
  timestamp: number
}

interface PerformanceChartProps {
  data: PedidoData[]
  loading?: boolean
  windowStart?: number
  windowEnd?: number
  totalPedidos?: number
  totalReceita?: number
}

const PerformanceChart = ({ 
  data = [], 
  loading, 
  windowStart, 
  windowEnd,
  totalPedidos,
  totalReceita 
}: PerformanceChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1000, height: 200 })

  useEffect(() => {
    if (!containerRef.current) return
    const update = () => {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      // Aumentado a altura no PC para 320px para melhor visualização
      setDimensions({ width: w, height: w < 640 ? 220 : w < 1024 ? 260 : 320 })
    }
    const observer = new ResizeObserver(update)
    observer.observe(containerRef.current)
    update()
    return () => observer.disconnect()
  }, [])

  const { width: WIDTH, height: HEIGHT } = dimensions
  const PADDING_TOP = HEIGHT * 0.12 // Mais espaço livre no topo
  const PADDING_BOTTOM = HEIGHT * 0.15
  const CHART_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM

  const maxReceita = useMemo(() => {
    const realMax = Math.max(...data.map(d => d.receita), 0)
    return realMax === 0 ? 100 : realMax
  }, [data])

  // 1. Cálculo de Pontos com Prevenção de Colisão (Offset Y)
  const points = useMemo(() => {
    const start = windowStart || (Date.now() - 24 * 60 * 60 * 1000)
    const end = windowEnd || Date.now()

    const pts = data.map((item) => {
      const x = ((item.timestamp - start) / (end - start)) * WIDTH
      const y = HEIGHT - PADDING_BOTTOM - (item.receita / maxReceita) * CHART_HEIGHT
      return { x, y: isNaN(y) ? HEIGHT - PADDING_BOTTOM : y }
    })

    // Ajuste de colisão: se pontos estão a < 20px no X, sobe o segundo para visibilidade
    for (let i = 1; i < pts.length; i++) {
      if (Math.abs(pts[i].x - pts[i - 1].x) < 20) {
        pts[i].y -= 12 // Deslocamento vertical para destaque
      }
    }
    return pts
  }, [data, maxReceita, WIDTH, HEIGHT, windowStart, windowEnd])

  // 6. Suporte a Curva Suave
  const mainPath = useMemo(() => {
    if (points.length < 2) return ''
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]; const next = points[i + 1]
      const ctrlX = (curr.x + next.x) / 2
      d += ` C ${ctrlX},${curr.y} ${ctrlX},${next.y} ${next.x},${next.y}`
    }
    return d
  }, [points])

  const fillPath = useMemo(() => {
    if (!mainPath || points.length < 2) return ''
    return `${mainPath} L ${points[points.length - 1].x},${HEIGHT - PADDING_BOTTOM} L ${points[0].x},${HEIGHT - PADDING_BOTTOM} Z`
  }, [mainPath, points, HEIGHT])

  // 2. Filtro de Labels X anti-sobreposição
  const visibleLabelIndexes = useMemo(() => {
    if (points.length === 0) return []
    const rawIndexes = data.length <= 8 ? data.map((_, i) => i) : [0, Math.floor(data.length / 2), data.length - 1]
    
    const filtered: number[] = []
    let lastX = -200
    
    rawIndexes.forEach(idx => {
      const x = points[idx].x
      if (x - lastX > 70) {
        filtered.push(idx)
        lastX = x
      } else if (filtered.length > 0) {
        // Prioriza sempre o último se houver conflito nas bordas
        filtered[filtered.length - 1] = idx
        lastX = x
      }
    })
    return filtered
  }, [points, data.length])

  if (loading) return (
    <div className="w-full h-[220px] md:h-[320px] flex items-center justify-center bg-white/5 rounded-3xl animate-pulse border border-white/5">
      <TrendingUp className="w-8 h-8 text-white/10" />
    </div>
  )

  if (data.length === 0) return (
    <div className="w-full h-[200px] md:h-[320px] flex flex-col items-center justify-center bg-orange-600/[0.03] rounded-[2.5rem] border border-dashed border-white/10 relative overflow-hidden group">
       <div className="absolute inset-0 bg-gradient-to-b from-orange-600/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
       <div className="relative z-10 flex flex-col items-center">
         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
           <ShoppingBag className="w-8 h-8 text-gray-700 opacity-40" />
         </div>
         <p className="text-gray-400 font-black uppercase tracking-[0.25em] text-[10px] md:text-xs">Nenhum pedido nas últimas 24h</p>
         <div className="mt-4 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
           <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
           <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Aguardando novos dados</span>
         </div>
       </div>
    </div>
  )

  return (
    <div ref={containerRef} className="w-full relative select-none group/chart overflow-visible pt-20 md:pt-16 pb-12">
      
      {/* 3. Header de Performance Premium - Reposicionado para PC */}
      <div className="absolute top-0 left-0 right-0 flex flex-col md:flex-row md:items-start justify-between gap-4 px-2">
         <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-orange-500 relative z-10 shadow-[0_0_15px_rgba(234,88,12,0.8)]" />
            </div>
            <div>
              <span className="text-xs md:text-sm font-black text-white uppercase tracking-[0.3em] italic block leading-none">Fluxo de Demanda</span>
              <span className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1.5 block">Monitoramento em Tempo Real</span>
            </div>
         </div>

         {(totalPedidos !== undefined || totalReceita !== undefined) && (
           <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-2xl backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                 <ShoppingBag className="w-3 h-3 text-orange-500" />
                 <div className="flex flex-col">
                    <span className="text-white font-black text-xs tabular-nums leading-none">{totalPedidos}</span>
                    <span className="text-gray-600 text-[7px] uppercase font-black mt-0.5">Pedidos</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 mr-1">
                 <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-green-500" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-white font-black text-xs tabular-nums leading-none">{formatarPreco(totalReceita || 0)}</span>
                    <span className="text-gray-600 text-[7px] uppercase font-black mt-0.5">Faturamento</span>
                 </div>
              </div>
           </div>
         )}
      </div>

      {/* Tooltip com Clamp e Design Elevado */}
      {hoveredIndex !== null && data[hoveredIndex] && (() => {
        const d = data[hoveredIndex]
        const { x } = points[hoveredIndex]
        const leftPercent = (x / WIDTH) * 100
        let transform = 'translateX(-50%)'; let left = `${leftPercent}%`
        if (leftPercent < 15) { transform = 'translateX(0)'; left = '4px' }
        else if (leftPercent > 85) { transform = 'translateX(-100%)'; left = `calc(${leftPercent}% - 4px)` }

        return (
          <div className="absolute z-30 pointer-events-none transition-all duration-300" style={{ left, top: '45px', transform }}>
            <div className="bg-[#0b0b0b]/95 border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl border-t-orange-500/50 border-t-2 relative overflow-hidden group/tooltip">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0 opacity-50" />
              <p className="text-[9px] font-black text-orange-500 uppercase mb-2 tracking-widest flex items-center gap-1.5">
                <Clock className="w-2.5 h-2.5" />
                Pedido #{hoveredIndex + 1} • {d.hora}
              </p>
              <p className="text-2xl font-display font-black text-white tabular-nums tracking-tighter leading-none">{formatarPreco(d.receita)}</p>
              <div className="mt-3 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                 <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Confirmado</span>
              </div>
            </div>
            <div className="w-3 h-3 bg-[#0b0b0b] border-r border-b border-white/10 rotate-45 mx-auto -mt-1.5 shadow-xl" />
          </div>
        )
      })()}

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grade de Referência Refinada - Opacidade reduzida para não brigar com o header */}
        {[0, 6, 12, 18, 24].map(h => {
           const start = windowStart || (Date.now() - 24 * 60 * 60 * 1000)
           const end = windowEnd || Date.now()
           const ref = new Date(start); ref.setHours(h, 0, 0, 0)
           if (ref.getTime() < start) ref.setDate(ref.getDate() + 1)
           const x = ((ref.getTime() - start) / (end - start)) * WIDTH
           if (x < 0 || x > WIDTH) return null
           return (
             <g key={h} className="transition-opacity duration-500">
               <line x1={x} y1={PADDING_TOP} x2={x} y2={HEIGHT - PADDING_BOTTOM} stroke="white" strokeOpacity="0.04" strokeWidth="1" />
               <text 
                 x={x} 
                 y={PADDING_TOP - 15} 
                 fill="white" 
                 fillOpacity="0.25" 
                 fontSize="10" 
                 fontWeight="black" 
                 textAnchor="middle"
                 className="font-mono tracking-widest"
               >
                 {h}H
               </text>
             </g>
           )
        })}

        {/* Linhas Horizontais de Valor */}
        {[0, 0.5, 1].map((frac) => {
          const y = HEIGHT - PADDING_BOTTOM - frac * CHART_HEIGHT
          return (
            <g key={frac}>
              <line x1="0" y1={y} x2={WIDTH} y2={y} stroke="white" strokeOpacity="0.03" strokeWidth="1" strokeDasharray="8 8" />
              <text x="0" y={y - 8} fill="white" fillOpacity="0.1" fontSize="9" fontWeight="black" fontFamily="monospace">
                {formatarPreco(frac * maxReceita)}
              </text>
            </g>
          )
        })}

        {/* Pedido Único - Efeito Vertical */}
        {points.length === 1 && (
           <line x1={points[0].x} y1={PADDING_TOP} x2={points[0].x} y2={HEIGHT - PADDING_BOTTOM} stroke="url(#chartFill)" strokeWidth="4" opacity="0.3" />
        )}

        {/* Path Principal com Glow */}
        <path d={fillPath} fill="url(#chartFill)" className="transition-all duration-700 ease-in-out" />
        <path 
          d={mainPath} 
          fill="none" 
          stroke="#EA580C" 
          strokeWidth="3" 
          strokeLinecap="round" 
          filter="url(#glow)"
          className="transition-all duration-700 ease-in-out"
        />

        {/* Pontos de Dados com Interação High-End */}
        {points.map((p, i) => (
          <g key={data[i].id} className="cursor-pointer">
            {hoveredIndex === i && (
               <circle cx={p.x} cy={p.y} r="12" fill="#EA580C" opacity="0.1" />
            )}
            <circle
              cx={p.x} cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              fill={hoveredIndex === i ? '#fff' : '#EA580C'}
              stroke="#0b0b0b" strokeWidth="2"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="transition-all duration-300 ease-out"
            />
          </g>
        ))}

        {/* Labels de Horário do Pedido (Eixo X) - VISIBILIDADE MÁXIMA E CLARITY */}
        {visibleLabelIndexes.map((i) => (
          <text
            key={data[i].id} x={points[i].x} y={HEIGHT + 12}
            textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
            fontSize={WIDTH < 640 ? "18" : "14"} 
            fill="white" 
            fillOpacity={hoveredIndex === i ? "1" : "0.95"}
            fontWeight="900"
            fontFamily="monospace"
            className="tracking-tighter transition-all duration-300 drop-shadow-2xl"
          >
            {data[i].hora}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default memo(PerformanceChart)
