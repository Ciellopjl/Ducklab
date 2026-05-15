'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { registrarLog } from "@/lib/logger"

// ============================================================================
// SERVER ACTIONS — GESTÃO DE USUÁRIOS COM AUDITORIA COMPLETA
// ============================================================================

async function getSessionAndTenant() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  // @ts-ignore
  const empresaId = user?.empresaAtiva as string | undefined

  if (!user?.email || !empresaId) {
    throw new Error("Sessão inválida ou empresa não identificada.")
  }

  return { session, user, empresaId }
}

async function checkIsBoss(empresaId: string, userEmail: string) {
  const vinculo = await prisma.empresaUsuario.findFirst({
    where: {
      empresaId,
      usuario: { email: userEmail.toLowerCase() },
      role: 'BOSS',
    }
  })

  if (!vinculo) {
    await registrarLog(
      userEmail,
      'SECURITY_ALERT',
      `⚠️ Tentativa de acessar gestão de usuários sem permissão BOSS`,
      undefined,
      empresaId
    )
    throw new Error(`Acesso negado. Apenas o Dono pode gerenciar usuários.`)
  }
}

export async function buscarUsuarios() {
  const { user, empresaId } = await getSessionAndTenant()
  await checkIsBoss(empresaId, user.email!)

  const vinculos = await prisma.empresaUsuario.findMany({
    where: { empresaId },
    include: { usuario: true },
    orderBy: { criadoEm: 'asc' }
  })

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()

  // SEGURANÇA: Nunca retornar dados desnecessários e ESCONDER o Master Admin
  return vinculos
    .filter(v => v.usuario.email.toLowerCase().trim() !== adminEmail)
    .map(v => ({
      id: v.id,
      usuarioId: v.usuarioId,
      email: v.usuario.email,
      nome: v.usuario.nome,
      imagem: v.usuario.imagem,
      role: v.role,
      ultimoAcesso: v.usuario.ultimoAcesso,
      criadoEm: v.criadoEm,
    }))
}

/**
 * Adicionar Usuário:
 * - Vincula o Gmail à empresa
 * - REMOVE o email da blocklist (RevokedSession) se ele estiver lá
 */
export async function adicionarUsuario(email: string, role: string = 'STAFF') {
  const { user, empresaId } = await getSessionAndTenant()
  await checkIsBoss(empresaId, user.email!)

  const emailNorm = email.toLowerCase().trim()
  
  if (!emailNorm || !emailNorm.includes('@gmail.com')) {
    throw new Error("Apenas emails @gmail.com são permitidos.")
  }

  // SEGURANÇA: Só permitir roles válidos
  const validRoles = ['STAFF', 'BOSS']
  const safeRole = validRoles.includes(role) ? role : 'STAFF'

  let usuarioDb = await prisma.usuario.findUnique({ where: { email: emailNorm } })
  if (!usuarioDb) {
    usuarioDb = await prisma.usuario.create({ data: { email: emailNorm } })
  }

  // Cria ou atualiza o vínculo
  await prisma.empresaUsuario.upsert({
    where: { empresaId_usuarioId: { empresaId, usuarioId: usuarioDb.id } },
    update: { role: safeRole },
    create: { empresaId, usuarioId: usuarioDb.id, role: safeRole },
  })

  // SEGURANÇA: Se o usuário estava revogado (banido), removemos da blocklist ao readicioná-lo
  await prisma.revokedSession.deleteMany({
    where: { email: emailNorm }
  })

  await registrarLog(
    user.email!,
    'ACESSO_AUTORIZADO',
    `Autorizou ${emailNorm} como ${safeRole}`,
    undefined,
    empresaId
  )

  revalidatePath('/admin/liberacao')
}

/**
 * Remover Usuário:
 * - Deleta o vínculo com a empresa
 * - ADICIONA o email à blocklist (RevokedSession) para deslogar sessões ativas
 */
export async function removerUsuario(vinculoId: string) {
  const { user, empresaId } = await getSessionAndTenant()
  await checkIsBoss(empresaId, user.email!)

  const vinculo = await prisma.empresaUsuario.findUnique({
    where: { id: vinculoId },
    include: { usuario: true }
  })

  if (!vinculo || vinculo.empresaId !== empresaId) {
    throw new Error("Vínculo não encontrado ou não pertence a esta empresa.")
  }

  if (vinculo.usuario.email === user.email) {
    throw new Error("Você não pode remover a si mesmo.")
  }

  const emailParaRevogar = vinculo.usuario.email.toLowerCase().trim()

  // 1. Deleta o vínculo no DB
  await prisma.empresaUsuario.delete({ where: { id: vinculoId } })

  // 2. SEGURANÇA: Adiciona na blocklist de sessões revogadas.
  // Isso fará com que o Middleware identifique o usuário e destrua a cookie dele no próximo request.
  await prisma.revokedSession.upsert({
    where: { email: emailParaRevogar },
    update: { revokedAt: new Date() },
    create: { email: emailParaRevogar }
  })

  await registrarLog(
    user.email!,
    'ACESSO_REMOVIDO',
    `Removeu acesso de ${emailParaRevogar} (Sessão Revogada)`,
    undefined,
    empresaId
  )

  revalidatePath('/admin/liberacao')
}
