'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, ArrowRight, Loader2 } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    whatsapp: '',
  })

  // Gera slug automaticamente
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value
    setFormData({
      ...formData,
      nome,
      slug: nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })
  }

  const handleCriarLoja = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    try {
      const res = await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        // Atualizar sessão para puxar novas credenciais
        await update()
        window.location.href = '/admin' // Recarregar painel completo
      } else {
        const error = await res.json()
        alert(error.erro || 'Erro ao criar loja')
      }
    } catch (err) {
      alert('Erro de conexão ao criar loja')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-marca-preto flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 space-y-8 animate-fade-in relative overflow-hidden">
        {/* Decorator */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-amber-500" />

        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-orange-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Store className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Crie sua Loja</h1>
          <p className="text-gray-400 text-sm">
            Bem-vindo ao SaaS! Que bom ter você aqui, {session?.user?.name || 'parceiro'}. Vamos configurar sua primeira loja.
          </p>
        </div>

        <form onSubmit={handleCriarLoja} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome da Loja</label>
            <input 
              type="text" 
              required
              value={formData.nome}
              onChange={handleNomeChange}
              placeholder="Ex: M.E burgue"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Link da sua loja (Slug)</label>
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-orange-500/50 transition-colors">
              <span className="py-3 pl-4 pr-1 text-gray-500 text-sm select-none">seusaas.com/</span>
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '') })}
                className="w-full bg-transparent py-3 pr-4 text-white outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">WhatsApp para Pedidos</label>
            <input 
              type="text" 
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="Ex: 5582999999999"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={salvando || !formData.nome || !formData.slug}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
          >
            {salvando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Começar a Vender
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-white/10">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Sair com outra conta
          </button>
        </div>
      </div>
    </div>
  )
}
