'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const GREEN_NEON = '#00EB69'
const GREEN_DARK = '#007C37'

// Premium Easing Curve
const premiumEasing = [0.22, 1, 0.36, 1]

// Minimalist Grid & Noise Background
function MinimalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#030303]" aria-hidden="true">
      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(${GREEN_NEON} 1px, transparent 1px), linear-gradient(90deg, ${GREEN_NEON} 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      
      {/* Noise Texture (Highly compatible CSS Data-URI) */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Subtle Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[#00EB69] rounded-full blur-[150px] opacity-[0.03]" />
    </div>
  )
}

// Brand Logo
function BrandLogo({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <div className="relative flex justify-center items-center">
      {/* Image Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: premiumEasing }}
        className="relative z-10 drop-shadow-[0_0_15px_rgba(0,235,105,0.3)] w-[72px] h-[72px] bg-transparent"
      >
        <Image
          src="/logo-duck.png"
          alt="Logo Ducklab Agência"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
    </div>
  )
}

export default function LoadingScreen({ onFinish }: { onFinish?: () => void }) {
  const [isDone, setIsDone] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    // Total duration of the intro is roughly 3.8 seconds before fading out.
    const timer = setTimeout(() => {
      setIsDone(true)
      setTimeout(() => onFinish?.(), 1000) // Delay calling onFinish to allow exit animation to complete
    }, 3800)
    
    return () => clearTimeout(timer)
  }, []) // Removed onFinish from dependencies to prevent infinite resetting if parent re-renders

  return (
    <>
      <link
        rel="preload"
        href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&display=swap"
        as="style"
      />
      <AnimatePresence>
        {!isDone && (
          <motion.div
            key="premium-loading"
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: premiumEasing }}
            className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center overflow-hidden"
            role="alert"
            aria-busy="true"
            aria-label="Carregando Ducklab Agência"
          >
            <MinimalBackground />
            
            <div className="relative z-10 flex flex-col items-center">
              <BrandLogo shouldReduceMotion={shouldReduceMotion} />
              


              {/* Minimal Loading Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-14 w-20 md:w-32 h-[1px] bg-white/5 relative overflow-hidden"
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
                  className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#00EB69] to-transparent opacity-80"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
