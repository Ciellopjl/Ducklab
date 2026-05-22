'use client'
// ============================================================================
// ADMIN LOGIN PAGE — Versão segura com CSRF, reCAPTCHA e sem dangerouslySetInnerHTML
// ============================================================================

import { useEffect } from 'react'
import Script from 'next/script'

export default function AdminLogin() {
  const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || '/hacker-duck'
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

  useEffect(() => {
    // Helper para ler cookies do navegador
    function getCookie(name: string): string {
      if (typeof document === 'undefined') return ''
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
      return ''
    }

    function init() {
      const input = document.getElementById('access-key-input') as HTMLInputElement | null
      const button = document.getElementById('submit-btn') as HTMLButtonElement | null
      const errorDiv = document.getElementById('error-msg-box') as HTMLElement | null

      if (!input || !button || !errorDiv) {
        setTimeout(init, 50)
        return
      }

      button.onclick = null
      input.onkeydown = null

      button.onclick = async (e) => {
        e.preventDefault()
        const val = input.value.trim()

        if (!val) {
          errorDiv.innerText = '[ POR FAVOR, INSIRA A CHAVE DE ACESSO ]'
          errorDiv.style.display = 'block'
          return
        }

        button.innerText = 'AUTENTICANDO...'
        button.disabled = true
        button.style.opacity = '0.5'
        errorDiv.style.display = 'none'

        // Executa reCAPTCHA antes de enviar a requisição
        let recaptchaToken = ''
        if (siteKey && !siteKey.startsWith('SUBSTITUA-')) {
          try {
            // @ts-ignore
            if (window.grecaptcha) {
              // @ts-ignore
              recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'admin_login' })
            }
          } catch (err) {
            console.error('[RECAPTCHA_ERROR]:', err)
          }
        }

        // Ler CSRF Token do cookie gerado pelo middleware
        const csrfToken = getCookie('csrf_token')

        try {
          const res = await fetch('/api/auth/admin', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ password: val, recaptchaToken }),
          })

          if (res.status === 429) {
            errorDiv.innerText = '[ MUITAS TENTATIVAS. BLOQUEADO. ]'
            errorDiv.style.display = 'block'
            button.innerText = 'ACESSAR'
            button.disabled = false
            button.style.opacity = '1'
          } else if (res.status === 403) {
            const data = await res.json().catch(() => ({}))
            errorDiv.innerText = `[ BLOQUEADO: ${data.error || 'Ação suspeita detectada pelo reCAPTCHA'} ]`
            errorDiv.style.display = 'block'
            button.innerText = 'ACESSAR'
            button.disabled = false
            button.style.opacity = '1'
          } else if (!res.ok) {
            errorDiv.innerText = '[ CREDENCIAIS INVÁLIDAS ]'
            errorDiv.style.display = 'block'
            button.innerText = 'ACESSAR'
            button.disabled = false
            button.style.opacity = '1'
          } else {
            window.location.href = ADMIN_PATH
          }
        } catch {
          errorDiv.innerText = '[ ERRO INTERNO / DE REDE ]'
          errorDiv.style.display = 'block'
          button.innerText = 'ACESSAR'
          button.disabled = false
          button.style.opacity = '1'
        }
      }

      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          button.click()
        }
      }
    }

    init()
  }, [ADMIN_PATH, siteKey])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-[#00ff41] font-mono p-4">
      {/* Carrega o script do reCAPTCHA de forma assíncrona com Next.js Script */}
      {siteKey && !siteKey.startsWith('SUBSTITUA-') && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="lazyOnload"
        />
      )}

      <div className="w-full max-w-sm p-8 border border-[#00ff41]/20 bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,255,65,0.1)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest uppercase mb-2 text-white">
            SYSTEM <span className="text-[#00ff41]">AUTH</span>
          </h1>
          <div className="h-0.5 w-full bg-[#00ff41]/30 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-[#00ff41] admin-progress-bar" />
          </div>
        </div>

        <div
          id="error-msg-box"
          className="text-red-500 text-xs text-center uppercase tracking-widest p-4 border border-red-500 bg-red-500/10 mb-4 font-mono break-all"
          style={{ display: 'none' }}
        />

        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#00ff41]/70 mb-2">
              ACCESS KEY
            </label>
            <input
              id="access-key-input"
              type="password"
              className="w-full bg-black border border-[#00ff41]/30 p-3 text-white focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all placeholder:text-gray-700 font-mono"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            id="submit-btn"
            type="button"
            className="w-full border border-[#00ff41] text-[#00ff41] p-3 uppercase tracking-widest text-sm font-bold transition-all hover:bg-[#00ff41] hover:text-black active:scale-95 cursor-pointer"
          >
            ACESSAR
          </button>
        </div>
      </div>
    </div>
  )
}
