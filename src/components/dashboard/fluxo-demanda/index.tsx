'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, TrendingUp, Clock, Activity, AlertCircle } from 'lucide-react'
import { useDemanda } from './use-demanda'
import { DemandChart } from './demand-chart'

export default function FluxoDemanda() {
  const { demanda, isLoading, isError } = useDemanda()
  const [currentTime, setCurrentTime] = useState<string>('')

  // Atualiza o relógio a cada segundo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour12: false }))
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  }

  if (isError) {
    return (
      <div className="w-full p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 opacity-50" />
        <p className="text-red-500/80 font-black uppercase tracking-widest text-xs">Erro ao carregar dados do fluxo</p>
      </div>
    )
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full bg-[#080808] border border-white/[0.03] rounded-[2.5rem] p-6 md:p-8 overflow-hidden relative group min-h-[400px] md:min-h-[500px]"
    >
      {/* 1. Header Limpo e Badge */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
              Fluxo de Demanda
            </h2>
            <div className="hidden md:flex items-center gap-2 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Ao Vivo</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5 md:hidden">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
             <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Ao Vivo • Tempo Real</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-black font-mono tabular-nums text-white/80">
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Métricas em Destaque */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div 
          variants={itemVariants}
          className="bg-white/[0.02] border-l-4 border-l-orange-500 border border-white/[0.03] p-5 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pedidos</p>
          <h3 className="text-2xl md:text-4xl font-black text-white tabular-nums leading-none">
            {demanda?.pedidos || 0}
          </h3>
          <p className="text-[9px] font-bold text-orange-500/60 uppercase mt-2">Hoje</p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white/[0.02] border-l-4 border-l-green-500 border border-white/[0.03] p-5 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Faturamento</p>
          <h3 className="text-2xl md:text-4xl font-black text-white tabular-nums leading-none">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(demanda?.faturamento || 0)}
          </h3>
          <p className="text-[9px] font-bold text-green-500/60 uppercase mt-2">Receita Bruta</p>
        </motion.div>
      </div>

      {/* 3. Gráfico ou Estado Vazio */}
      <AnimatePresence mode="wait">
        {!isLoading && demanda && demanda.historico.length > 0 ? (
          <motion.div 
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <DemandChart data={demanda.historico} />
          </motion.div>
        ) : !isLoading ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-16 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 relative">
              <Activity className="w-10 h-10 text-gray-700 opacity-30" />
              <div className="absolute inset-0 bg-orange-500/5 rounded-full animate-pulse" />
            </div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Sem atividade recente</h4>
            <p className="text-gray-600 text-xs max-w-[200px] font-medium leading-relaxed">
              Aguardando o primeiro pedido do dia para iniciar o monitoramento.
            </p>
          </motion.div>
        ) : (
          <div className="w-full h-[280px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
      </AnimatePresence>
      
      {/* 4. Footer do Gráfico */}
      <div className="mt-6 flex items-center justify-between border-t border-white/[0.03] pt-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sincronizado</span>
        </div>
        <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest"></p>
      </div>
    </motion.div>
  )
}
