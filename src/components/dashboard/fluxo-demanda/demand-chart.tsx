'use client'

import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { PedidoDemanda } from './types'

interface DemandChartProps {
  data: PedidoDemanda[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PedidoDemanda
    return (
      <div className="bg-[#0b0b0b]/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">
          Pedido #{data.id.slice(-4)} • {data.horario}
        </p>
        <p className="text-xl font-black text-white tabular-nums">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valor)}
        </p>
        <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">
          {data.itens} {data.itens === 1 ? 'item' : 'itens'}
        </p>
      </div>
    )
  }
  return null
}

export function DemandChart({ data }: DemandChartProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Ordenar pedidos por horário
  const sortedData = [...data].sort((a, b) => a.horario.localeCompare(b.horario))

  // minTickGap dinâmico
  const getMinTickGap = () => {
    const len = sortedData.length
    if (len <= 5) return 20
    if (len <= 10) return 40
    return 60
  }

  // Margens responsivas
  const margin = isMobile 
    ? { top: 10, right: 5, left: -25, bottom: 0 }
    : { top: 10, right: 10, left: -20, bottom: 0 }

  return (
    <div className="w-full h-[200px] md:h-[280px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={sortedData}
          margin={margin}
        >
          <defs>
            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="rgba(255,255,255,0.03)" 
          />
          <XAxis 
            dataKey="horario" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }}
            minTickGap={getMinTickGap()}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900 }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: 'rgba(249,115,22,0.2)', strokeWidth: 2 }} 
            wrapperStyle={{ zIndex: 50 }}
            position={isMobile ? { x: 0, y: 0 } : undefined}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="#f97316"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValor)"
            animationDuration={1500}
            activeDot={{ r: 6, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
