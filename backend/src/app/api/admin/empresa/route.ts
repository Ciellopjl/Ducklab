import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/apiGuard'
import { registrarLog } from '@/lib/logger'
import { safeParse, EmpresaUpdateSchema } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAuth('BOSS', 'STAFF')
  if (auth instanceof NextResponse) return auth

  try {
    const rawEmpresa: any[] = await prisma.$queryRaw`
      SELECT 
        id, slug, nome, logo, whatsapp, "corPrimaria", 
        "horarioAbertura", "horarioFechamento", "diasAbertos",
        "taxaEntrega", endereco, "chavePix"
      FROM "Empresa" 
      WHERE id = ${auth.tenantId}
      LIMIT 1
    `

    const empresa = rawEmpresa[0]

    if (!empresa) {
      return NextResponse.json({ erro: 'Unidade não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      ...empresa,
      diasAbertos: empresa.diasAbertos || "0,1,2,3,4,5,6"
    })
  } catch (erro) {
    return NextResponse.json({ erro: 'Erro ao buscar dados da empresa' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth('BOSS')
  if (auth instanceof NextResponse) return auth

  try {
    const dados = await request.json()
    const parsed = safeParse(EmpresaUpdateSchema, dados)
    if ('error' in parsed) return NextResponse.json({ erro: parsed.error }, { status: 400 })

    const { data } = parsed

    const empresa = await prisma.empresa.update({
      where: { id: auth.tenantId },
      data: {
        nome: data.nome ?? undefined,
        whatsapp: data.whatsapp ? data.whatsapp.replace(/\D/g, '') : undefined,
        horarioAbertura: data.horarioAbertura ?? undefined,
        horarioFechamento: data.horarioFechamento ?? undefined,
        taxaEntrega: typeof data.taxaEntrega === 'string' ? parseFloat(data.taxaEntrega) : data.taxaEntrega,
        endereco: data.endereco ?? undefined,
        chavePix: data.chavePix ?? undefined,
        logo: data.logo ?? undefined,
        diasAbertos: data.diasAbertos ?? undefined,
      },
      select: {
        id: true,
        slug: true,
        nome: true,
        diasAbertos: true,
      }
    })

    // Confirmar que o valor foi persistido antes de revalidar
    const confirmacao: any[] = await prisma.$queryRaw`
      SELECT "diasAbertos" FROM "Empresa" WHERE id = ${auth.tenantId} LIMIT 1
    `
    console.log('[CONFIRMACAO_BD]', confirmacao[0]?.diasAbertos)
    console.log('[VALOR_SALVO]', empresa.diasAbertos)

    if (empresa.slug) {
      revalidatePath(`/${empresa.slug}`, 'layout')
      revalidatePath('/') // Revalida a Home Raiz
      revalidatePath('/admin/configuracoes', 'layout')
    }


    await registrarLog(
      auth.userEmail,
      'CONFIG_UPDATE',
      `Alterou configs de "${empresa.nome}" | diasAbertos: ${empresa.diasAbertos}`,
      undefined,
      auth.tenantId
    )

    return NextResponse.json(empresa)
  } catch (erro: any) {
    console.error('[EMPRESA_UPDATE_ERROR]:', erro)
    return NextResponse.json({ erro: 'Erro ao atualizar', detalhes: erro.message }, { status: 500 })
  }
}
