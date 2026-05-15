'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function HeartbeatProvider() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.email) return

    // Função para avisar que o usuário está ativo
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/usuarios/heartbeat', { 
            method: 'POST',
            cache: 'no-store'
        })
      } catch (error) {
        console.error('Heartbeat failed')
      }
    }

    // Envia o primeiro logo ao carregar
    sendHeartbeat()

    // Envia a cada 60 segundos (intervalo seguro)
    const interval = setInterval(sendHeartbeat, 60 * 1000)

    return () => clearInterval(interval)
  }, [session])

  return null // Este componente não renderiza nada visualmente
}
