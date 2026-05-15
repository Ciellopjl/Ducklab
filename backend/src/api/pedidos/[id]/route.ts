import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'

// Status permitidos — whitelist (previne injection de status arbitrário)
const VALID_STATUSES = ['pendente', 'preparando', 'entregando', 'entregue', 'cancelado']

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const { status } = await request.json()

    // Validação de status contra whitelist
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { erro: `Status inválido. Permitidos: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // Tenant isolation
    const pedidoExistente = await prisma.pedido.findFirst({
      where: { id: params.id, empresaId: auth.tenantId }
    })
    if (!pedidoExistente) {
      return NextResponse.json({ erro: 'Pedido não encontrado' }, { status: 404 })
    }

    const pedido = await prisma.pedido.update({
      where: { id: params.id },
      data: { status },
    })

    await registrarLog(
      auth.userEmail,
      'PEDIDO_STATUS_ALTERADO',
      `Alterou pedido #${pedido.serial || pedido.id.slice(-4)} de "${pedidoExistente.status}" → "${status}"`,
      undefined,
      auth.tenantId
    )
    return NextResponse.json(pedido)
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao atualizar status' }, { status: 500 })
  }
}
