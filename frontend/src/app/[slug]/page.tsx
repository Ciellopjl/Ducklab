'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import InteractiveMenu from '@/components/InteractiveMenu'
import PromocoesSection from '@/components/PromocoesSection'
import FooterSection from '@/components/FooterSection'
import CartSidebar from '@/components/CartSidebar'
import { Promocao } from '@/data/types'
import { useTenant } from '@/components/TenantProvider'

export default function HomePage() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([])
  const empresa = useTenant()

  useEffect(() => {
    async function carregarPromocoes() {
      try {
        const res = await fetch(`/api/promocoes?empresaId=${empresa.id}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setPromocoes(data)
          } else {
            console.error('Promoções não retornou um array:', data)
          }
        }
      } catch (erro) {
        console.error('Erro ao carregar promoções:', erro)
      }
    }
    carregarPromocoes()
  }, [empresa.id])

  return (
    <>
      <CartSidebar />
      <main>
        <HeroSection />
        <InteractiveMenu />
        <PromocoesSection promocoes={promocoes} />
      </main>
    </>
  )
}
