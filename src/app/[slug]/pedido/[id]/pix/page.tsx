import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
// @ts-ignore
import PixClient from './PixClient'

export const dynamic = 'force-dynamic'

export default async function PixPage({ params }: { params: { slug: string, id: string } }) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: { empresa: true }
  })

  if (!pedido || pedido.empresa?.slug !== params.slug) {
    notFound()
  }

  // @ts-ignore
  const chavePix = pedido.empresa?.chavePix || '00020101021126500014br.gov.bcb.pix0128marcoseduardo52941@gmail.com5204000053039865802BR5921MARCOS E F DOS SANTOS6007BATALHA62070503***630470BF'

  return <PixClient pedido={pedido} chavePix={chavePix} />
}
