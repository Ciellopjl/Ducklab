'use client'

import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

const premiumEasing = [0.22, 1, 0.36, 1]

// The head occupies roughly the top 42% of the mascot image.
// We split the image into two layers: body (static) and head (follows cursor).
// The head pivots from the neck area (bottom of the head clip).
const HEAD_CLIP = 'inset(0 0 58% 0)'   // top 42%
const BODY_CLIP = 'inset(38% 0 0 0)'   // bottom 62%, with 4% overlap for seamless join

export default function DucklabMascot() {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 120, damping: 18, mass: 0.6 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Head movement — subtle shift + rotation to simulate neck turning
  const headX = useTransform(smoothX, [-1, 1], [-12, 12])
  const headY = useTransform(smoothY, [-1, 1], [-6, 6])
  const headRotateZ = useTransform(smoothX, [-1, 1], [-3, 3])
  const headRotateX = useTransform(smoothY, [-1, 1], [4, -4])

  useEffect(() => {
    if (shouldReduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const x = (e.clientX - centerX) / (window.innerWidth / 2)
      const y = (e.clientY - centerY) / (window.innerHeight / 2)

      mouseX.set(Math.max(-1, Math.min(1, x)))
      mouseY.set(Math.max(-1, Math.min(1, y)))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [shouldReduceMotion, mouseX, mouseY])

  const imageClasses = "w-auto h-auto max-w-[280px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[480px] xl:max-w-[520px] select-none pointer-events-none"

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* Ambient glow */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : { opacity: [0.06, 0.12, 0.06], scale: [1, 1.05, 1] }
        }
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-[#00EB69] blur-[100px] opacity-[0.08] pointer-events-none"
        aria-hidden="true"
      />

      {/* Floor glow */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : { opacity: [0.15, 0.3, 0.15], scaleX: [0.9, 1.1, 0.9] }
        }
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[35%] h-[8%] rounded-full bg-[#00EB69] blur-[30px] opacity-[0.2] pointer-events-none"
        aria-hidden="true"
      />

      {/* Mascot — entrance + floating */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: premiumEasing, delay: 0.15 }}
        className="relative z-10 flex items-center justify-center"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Neon ring glow */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    boxShadow: [
                      '0 0 40px 8px rgba(0,235,105,0.08), inset 0 0 40px 8px rgba(0,235,105,0.03)',
                      '0 0 60px 16px rgba(0,235,105,0.14), inset 0 0 60px 16px rgba(0,235,105,0.06)',
                      '0 0 40px 8px rgba(0,235,105,0.08), inset 0 0 40px 8px rgba(0,235,105,0.03)',
                    ],
                  }
            }
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[65%] aspect-square rounded-full pointer-events-none"
            aria-hidden="true"
          />

          {/* ── BODY LAYER (static) ── */}
          <div className="relative drop-shadow-[0_0_30px_rgba(0,235,105,0.2)]">
            <Image
              src="/mascote 3d.png"
              alt="Mascote 3D Ducklab Agência"
              width={520}
              height={650}
              priority
              className={imageClasses}
              draggable={false}
              style={{ clipPath: BODY_CLIP }}
            />
          </div>

          {/* ── HEAD LAYER (follows cursor) ── */}
          <motion.div
            className="absolute inset-0 drop-shadow-[0_0_30px_rgba(0,235,105,0.2)]"
            style={{
              x: headX,
              y: headY,
              rotateZ: headRotateZ,
              rotateX: headRotateX,
              transformOrigin: '50% 42%', // pivot at neck
            }}
          >
            <Image
              src="/mascote 3d.png"
              alt=""
              width={520}
              height={650}
              priority
              className={imageClasses}
              draggable={false}
              aria-hidden="true"
              style={{ clipPath: HEAD_CLIP }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
