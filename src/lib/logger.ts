import { prisma } from './prisma'

// ============================================================================
// LOGGER DE AUDITORIA — NÍVEL ENTERPRISE
// ============================================================================
// 1. Captura IP real do request
// 2. Sanitiza emails para lowercase
// 3. Não expõe stack traces em produção
// 4. Fallback para console.error se DB falhar (sem arquivo no filesystem)
// ============================================================================

type LogAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'PRODUTO_CRIADO' 
  | 'PRODUTO_EDITADO' 
  | 'PRODUTO_DELETADO' 
  | 'CATEGORIA_CRIADA' 
  | 'CATEGORIA_EDITADA' 
  | 'CATEGORIA_DELETADA' 
  | 'CUPOM_CRIADO' 
  | 'CUPOM_EDITADO' 
  | 'CUPOM_DELETADO'
  | 'PROMOCAO_CRIADA'
  | 'PROMOCAO_EDITADA'
  | 'PROMOCAO_DELETADA'
  | 'ACESSO_AUTORIZADO'
  | 'ACESSO_REMOVIDO'
  | 'PEDIDO_STATUS_ALTERADO'
  | 'PEDIDO_VALOR_ALTERADO'
  | 'ADICIONAL_CRIADO'
  | 'ADICIONAL_EDITADO'
  | 'ADICIONAL_EXCLUIDO'
  | 'PROJETO_CRIADO'
  | 'PROJETO_EDITADO'
  | 'PROJETO_DELETADO'
  | 'SECURITY_ALERT'
  | 'CONFIG_UPDATE'


export async function registrarLog(
  usuarioEmail: string, 
  acao: LogAction, 
  detalhes: string, 
  ip?: string,
  empresaId?: string
) {
  try {
    // Sanitização de input
    const emailSafe = (usuarioEmail || 'sistema').toLowerCase().trim().slice(0, 254)
    const detalhesSafe = (detalhes || '').slice(0, 1000)
    const ipSafe = (ip || '').replace(/[^0-9a-fA-F.:,\s]/g, '').slice(0, 100)

    // @ts-ignore
    await prisma.log.create({
      data: {
        usuarioEmail: emailSafe,
        acao,
        detalhes: detalhesSafe,
        ip: ipSafe || undefined,
        empresaId: empresaId || undefined,
      }
    })
  } catch (error: any) {
    // Em produção: apenas logar o erro sem stack trace
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      console.error(`[AUDIT ERROR] ${acao} by ${usuarioEmail}: DB write failed`)
    } else {
      console.error(`[AUDIT ERROR] ${acao}:`, error.message)
    }
  }
}
