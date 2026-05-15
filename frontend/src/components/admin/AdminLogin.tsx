'use client'

import { motion } from 'framer-motion'
import { AlertOctagon, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function AdminLogin() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/admin' })
  }

  // Se houver erro de acesso negado (usuário não autorizado pela callback auth.ts)
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-marca-fundo relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-card p-8 border border-orange-500/30 relative z-10 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-orange-600/20 rounded-full flex items-center justify-center border border-orange-500/50">
              <AlertOctagon className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <h1 className="text-3xl font-display font-black text-orange-500 mb-4 uppercase tracking-wider">Acesso Negado</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Você não tem permissão para acessar o painel administrativo.
            Seu usuário foi removido, inativado ou você entrou com a conta errada.
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-4 text-white bg-orange-600 hover:bg-orange-700 transition-colors text-sm font-bold rounded-2xl shadow-lg shadow-orange-600/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Retornar para o Site
            </Link>
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 py-4 text-gray-400 hover:text-white transition-colors text-sm border border-white/5 rounded-2xl hover:bg-white/5"
            >
              Tentar outra conta
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-marca-fundo relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[120px] rounded-full animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 border border-white/10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-24 h-24 object-cover rounded-full border-2 border-orange-600 shadow-2xl shadow-orange-600/40" 
              />
              <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-pulse" />
            </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">M.E BURGUE Admin</h1>
          <p className="text-gray-400 text-sm">Acesso exclusivo para administradores</p>
        </div>

        <div className="space-y-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-16 rounded-2xl bg-white text-black flex items-center justify-center gap-4 font-bold hover:bg-gray-100 transition-all active:scale-[0.98] shadow-xl shadow-white/5"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
            Entrar com Google
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-4 text-gray-400 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-white/5 rounded-2xl hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Loja
          </Link>
        </div>

        <p className="mt-12 text-center text-xs text-gray-500">
          &copy; M.E BURGUE.
        </p>
      </motion.div>
    </div>
  )
}
