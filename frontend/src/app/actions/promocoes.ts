'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'

/**
 * Server Action: Buscar Promoções
 * Aberto ao público e Admin
 */
export async function buscarPromocoes() {
  try {
    return await prisma.promocao.findMany({
      orderBy: { id: 'asc' }
    })
  } catch (error) {
    console.error('[ACTION_ERROR]: buscarPromocoes', error)
    return []
  }
}

/**
 * Server Action: Criar Promoção
 * Proteção: BOSS only + Audit Log
 */
export async function criarPromocao(data: {
  titulo: string
  descricao: string
  tag: string
  icone: string
  cor: string
  corBorda: string
}) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof Response) throw new Error('Não autorizado')

  try {
    const promocao = await prisma.promocao.create({
      data: {
        ...data,
        // Caso as promoções sejam por empresa no futuro, o tenantId já está aqui:
        // empresaId: auth.tenantId 
      }
    })

    await registrarLog(auth.userEmail, 'PROMOCAO_CRIADA', `Criou promoção: ${data.titulo}`, undefined, auth.tenantId)
    
    revalidatePath('/')
    revalidatePath('/admin/promocoes')
    return promocao
  } catch (error) {
    console.error('[ACTION_ERROR]: criarPromocao', error)
    throw new Error('Falha ao criar promoção')
  }
}

/**
 * Server Action: Atualizar Promoção
 * Proteção: BOSS only + Audit Log
 */
export async function atualizarPromocao(id: string, data: {
  titulo: string
  descricao: string
  tag: string
  icone: string
  cor: string
  corBorda: string
}) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof Response) throw new Error('Não autorizado')

  try {
    const promocao = await prisma.promocao.update({
      where: { id },
      data
    })

    await registrarLog(auth.userEmail, 'PROMOCAO_EDITADA', `Editou promoção: ${data.titulo}`, undefined, auth.tenantId)

    revalidatePath('/')
    revalidatePath('/admin/promocoes')
    return promocao
  } catch (error) {
    throw new Error('Falha ao atualizar promoção')
  }
}

/**
 * Server Action: Excluir Promoção
 * Proteção: BOSS only + Audit Log
 */
export async function excluirPromocao(id: string) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof Response) throw new Error('Não autorizado')

  try {
    const promocao = await prisma.promocao.findUnique({ where: { id } })
    await prisma.promocao.delete({ where: { id } })
    
    if (promocao) {
        await registrarLog(auth.userEmail, 'PROMOCAO_EXCLUIDA', `Excluiu promoção: ${promocao.titulo}`, undefined, auth.tenantId)
    }

    revalidatePath('/')
    revalidatePath('/admin/promocoes')
  } catch (error) {
    throw new Error('Falha ao excluir promoção')
  }
}
