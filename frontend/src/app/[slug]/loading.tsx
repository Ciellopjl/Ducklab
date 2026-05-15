'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

export default function LoadingStore() {
  const [visible, setVisible] = useState(true)

  // Força o fade-out suave antes de ser desmontado pelo Next.js
  useEffect(() => {
    return () => setVisible(false)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0a0a0a]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Ring animado */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Anel externo girando */}
            <div className="absolute w-20 h-20 rounded-full border-[3px] border-transparent border-t-[var(--color-primary,#FF4D00)] animate-spin" />
            {/* Anel interno estático */}
            <div className="absolute w-20 h-20 rounded-full border-[3px] border-white/5" />

            {/* Ícone central */}
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary,#FF4D00)]/10 border border-[var(--color-primary,#FF4D00)]/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[var(--color-primary,#FF4D00)]" />
            </div>
          </motion.div>

          {/* Textos */}
          <motion.div
            className="mt-8 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
          >
            <p className="text-sm font-bold text-white tracking-widest uppercase">
              Carregando
            </p>
            {/* Dots animados */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary,#FF4D00)]/60"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
