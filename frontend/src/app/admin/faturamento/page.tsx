'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  BarChart3,
  ArrowUpRight
} from 'lucide-react'
import { formatarPreco } from '@/lib/utils'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function FaturamentoPage() {
  const hoje = new Date()
  const mesAtual = hoje.getMonth()     // 0-11
  const anoAtualReal = hoje.getFullYear()

  // Data local de hoje (sem problema de fuso UTC)
  const hojeLocal = hoje.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).split('/').reverse().join('-')

  const [faturamentoData, setFaturamentoData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(hojeLocal)
  const [anoAtual, setAnoAtual] = useState(anoAtualReal)
  const [mesSelecionado, setMesSelecionado] = useState<number>(mesAtual)

  // Ref do mês atual para scroll automático
  const mesAtualRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchFaturamento() {
      try {
        const res = await fetch('/api/faturamento')
        const data = await res.json()
        setFaturamentoData(data)
      } catch (error) {
        console.error('Erro ao carregar faturamento:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFaturamento()
  }, [])

  // O mês atual já é selecionado automaticamente no estado inicial:
  // const [mesSelecionado, setMesSelecionado] = useState<number>(mesAtual)

  const totalAno = useMemo(() => {
    return Object.entries(faturamentoData)
      .filter(([date]) => date.startsWith(anoAtual.toString()))
      .reduce((acc, [_, valor]) => acc + valor, 0)
  }, [faturamentoData, anoAtual])

  const faturamentoPorMes = useMemo(() => {
    const meses: number[] = new Array(12).fill(0)
    Object.entries(faturamentoData).forEach(([date, valor]) => {
      if (date.startsWith(anoAtual.toString())) {
        const mes = parseInt(date.split('-')[1]) - 1
        meses[mes] += valor
      }
    })
    return meses
  }, [faturamentoData, anoAtual])

  const melhorMes = useMemo(() => {
    const max = Math.max(...faturamentoPorMes)
    return max > 0 ? faturamentoPorMes.indexOf(max) : -1
  }, [faturamentoPorMes])

  const renderMonth = (monthIndex: number) => {
    const totalMes = faturamentoPorMes[monthIndex]
    const daysInMonth = new Date(anoAtual, monthIndex + 1, 0).getDate()
    const firstDay = new Date(anoAtual, monthIndex, 1).getDay()
    const esMesAtual = anoAtual === anoAtualReal && monthIndex === mesAtual
    const eMelhorMes = monthIndex === melhorMes && totalMes > 0

    return (
      <div
        key={monthIndex}
        ref={esMesAtual ? mesAtualRef : undefined}
        id={`mes-${monthIndex}`}
        className={`glass-card p-4 border flex flex-col transition-all duration-300 ${
          mesSelecionado === monthIndex
            ? 'border-orange-500/50 shadow-[0_0_20px_rgba(234,88,12,0.12)]'
            : esMesAtual
            ? 'border-orange-500/25'
            : 'border-white/5'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm ${esMesAtual ? 'text-orange-400' : 'text-white'}`}>
              {MESES[monthIndex]}
            </h3>
            {esMesAtual && (
              <span className="text-[8px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                Atual
              </span>
            )}
            {eMelhorMes && !esMesAtual && (
              <span className="text-[8px] font-black bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                🏆 Top
              </span>
            )}
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            totalMes > 0 ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-600'
          }`}>
            {formatarPreco(totalMes)}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-2 md:gap-3 flex-1 mt-4">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] md:text-xs text-gray-500 font-black text-center py-2">{d}</div>
          ))}
          {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1
            const dateStr = `${anoAtual}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            const temFaturamento = faturamentoData[dateStr] > 0
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === hojeLocal

            return (
              <button
                key={day}
                onClick={() => { setSelectedDate(dateStr); setMesSelecionado(monthIndex) }}
                className={`
                  aspect-square rounded-xl text-xs md:text-sm font-bold flex items-center justify-center transition-all relative
                  ${temFaturamento ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-600'}
                  ${isSelected ? 'scale-110 !bg-orange-500 !text-white z-10 shadow-lg' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-orange-500/60' : ''}
                  hover:scale-105 hover:bg-white/10 active:scale-95
                `}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
      </div>
    )
  }

  const faturamentoDia = faturamentoData[selectedDate] || 0

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-display font-black text-white flex items-center gap-2 md:gap-3">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            Centro Financeiro
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Faturamento detalhado em {anoAtual}</p>
        </div>

        {/* Seletor de Ano */}
        <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setAnoAtual(v => v - 1)}
            className="p-2 hover:bg-white/10 rounded-xl text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white px-4">{anoAtual}</span>
          <button 
            onClick={() => setAnoAtual(v => v + 1)}
            className="p-2 hover:bg-white/10 rounded-xl text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="glass-card p-4 md:p-6 border-l-4 border-green-500">
           <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Total do Ano</p>
           <h2 className="text-xl md:text-4xl font-display font-black text-white">{formatarPreco(totalAno)}</h2>
           <p className="hidden md:flex text-[10px] text-gray-600 mt-2 items-center gap-1">
             <TrendingUp className="w-3 h-3 text-green-500" />
             Faturamento bruto anual
           </p>
        </div>

        <div className="glass-card p-4 md:p-6 border-l-4 border-orange-500">
           <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Faturamento do Dia</p>
           <h2 className="text-xl md:text-4xl font-display font-black text-white">{formatarPreco(faturamentoDia)}</h2>
           <p className="text-[8px] md:text-[10px] text-gray-600 mt-1 md:mt-2 flex items-center gap-1 uppercase font-bold tracking-tighter truncate">
             {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric'})}
           </p>
        </div>

        <div className="col-span-2 md:col-span-1 glass-card p-4 md:p-6 border-l-4 border-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
           <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Média Mensal</p>
           <h2 className="text-xl md:text-4xl font-display font-black text-white">{formatarPreco(totalAno / 12)}</h2>
           <p className="hidden md:flex text-[10px] text-gray-600 mt-2 items-center gap-1">
             <ArrowUpRight className="w-3 h-3 text-blue-500" />
             Baseado em pedidos entregues
           </p>
        </div>
      </div>

      {/* ─── SELETOR DE MÊS ──────────────────────────────────────────────────── */}
      <div className="glass-card border border-white/5 p-4 md:p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-orange-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ir para o mês</p>
          </div>
          {anoAtual === anoAtualReal && (
            <button
              onClick={() => {
                setMesSelecionado(mesAtual)
                mesAtualRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className="text-[10px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest transition-colors border border-orange-500/20 px-3 py-1.5 rounded-xl hover:bg-orange-500/10"
            >
              Ir para hoje ↓
            </button>
          )}
        </div>

        {/* Grid de meses */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
          {MESES_ABREV.map((abrev, i) => {
            const esMesAtual = anoAtual === anoAtualReal && i === mesAtual
            const eSelecionado = i === mesSelecionado
            const temReceita = faturamentoPorMes[i] > 0

            return (
              <button
                key={i}
                onClick={() => {
                  setMesSelecionado(i)
                }}
                className={`relative flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all duration-200 border group ${
                  eSelecionado
                    ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/25 scale-105'
                    : esMesAtual
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10'
                }`}
              >
                {/* Ponto de receita */}
                {temReceita && (
                  <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    eSelecionado ? 'bg-white/80' : 'bg-green-500'
                  }`} />
                )}

                <span className={`text-[11px] font-black leading-none ${
                  eSelecionado ? 'text-white' : esMesAtual ? 'text-orange-400' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {abrev}
                </span>

                {esMesAtual && !eSelecionado && (
                  <div className="w-1 h-1 rounded-full bg-orange-500 mt-1" />
                )}
                {eSelecionado && (
                  <div className="w-1 h-1 rounded-full bg-white/60 mt-1" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Calendar Grid - Apenas mês selecionado */}
      <div className="max-w-xl mx-auto mt-8">
        {renderMonth(mesSelecionado)}
      </div>
    </div>
  )
}
