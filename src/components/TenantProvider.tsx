'use client'

import { createContext, useContext } from 'react'

export type EmpresaData = {
  id: string
  slug: string
  nome: string
  logo: string | null
  whatsapp: string | null
  corPrimaria: string | null
  horarioAbertura?: string | null
  horarioFechamento?: string | null
  diasAbertos?: string | null
  taxaEntrega?: number | null
  endereco?: string | null
  chavePix?: string | null
}

const TenantContext = createContext<EmpresaData | null>(null)

export function TenantProvider({ empresa, children }: { empresa: EmpresaData, children: React.ReactNode }) {
  return (
    <TenantContext.Provider value={empresa}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider')
  }
  return context
}
