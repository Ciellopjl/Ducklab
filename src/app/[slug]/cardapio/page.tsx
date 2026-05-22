'use client'

import Header from '@/components/Header'
import MenuSection from '@/components/MenuSection'
import FooterSection from '@/components/FooterSection'
import CartSidebar from '@/components/CartSidebar'

export default function CardapioPage() {
  return (
    <>
      <Header />
      <CartSidebar />
      <main className="pt-24">
        <MenuSection />
      </main>
      <FooterSection />
    </>
  )
}
