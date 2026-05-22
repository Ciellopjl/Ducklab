'use client'

import { SessionProvider } from "next-auth/react"
import { Toaster } from 'react-hot-toast'

const mockSession = {
  user: {
    id: "dev-admin-id",
    name: "Admin Ducklab",
    email: "admin@ducklab.com",
    image: "/logo-duck.png",
    role: "BOSS",
    empresaAtiva: "dev-empresa-id",
    empresas: [{ empresaId: "dev-empresa-id", role: "BOSS" }]
  },
  expires: "2099-01-01T00:00:00.000Z"
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={mockSession as any}>
      {children}
      <Toaster position="bottom-right" reverseOrder={false} />
    </SessionProvider>
  )
}
