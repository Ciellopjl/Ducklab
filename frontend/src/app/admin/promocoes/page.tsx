import { buscarPromocoes } from '@/app/actions/promocoes'
import PromocoesClient from './PromocoesClient'

export const dynamic = 'force-dynamic'

export default async function PromocoesPage() {
  const promocoes = await buscarPromocoes()

  return (
    <div className="p-4 md:p-6 lg:p-10">
      <PromocoesClient initialData={promocoes} />
    </div>
  )
}
