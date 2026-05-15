import pg from 'pg'
import { config } from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
config()

const { Client } = pg
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  await client.connect()
  
  const { rows: empresas } = await client.query('SELECT id, nome FROM "Empresa" LIMIT 1')
  if (empresas.length === 0) {
    console.log('Nenhuma empresa encontrada.')
    await client.end()
    return
  }
  const empresaId = empresas[0].id
  console.log(`Empresa: ${empresas[0].nome} (${empresaId})`)

  // 1. Criar Categoria Combos
  const { rows: existingCat } = await client.query('SELECT id FROM "Categoria" WHERE "empresaId" = \$1 AND "nome" = \$2', [empresaId, 'combos'])
  
  let categoriaId
  if (existingCat.length === 0) {
    categoriaId = uuidv4()
    await client.query(
      'INSERT INTO "Categoria" (id, "empresaId", nome, label, icone, "adicionaisHabilitados") VALUES (\$1, \$2, \$3, \$4, \$5, \$6)',
      [categoriaId, empresaId, 'combos', '🍟 Combos Imperdíveis', '🎁', true]
    )
    console.log('Categoria "combos" criada.')
  } else {
    categoriaId = existingCat[0].id
    console.log('Categoria "combos" já existe.')
  }

  // 2. Criar Produtos de Exemplo para Combos
  const combos = [
    {
      nome: 'COMBO ME BURGER CLÁSSICO',
      descricao: '1 M.E Burger Clássico + Batata M + Coca-Cola 350ml. O queridinho da galera!',
      preco: 32.90,
      imagem: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800'
    },
    {
      nome: 'COMBO DUPLO SMASH',
      descricao: '2 M.E Burgers Clássicos + Batata G + 2 Coca-Cola 350ml. Ideal para dividir!',
      preco: 58.00,
      imagem: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800'
    },
    {
      nome: 'COMBO FAMÍLIA INVICTO',
      descricao: '4 Burgers (Clássico/Tradicional) + 2 Batatas G + Coca-Cola 2L. A festa completa!',
      preco: 110.00,
      imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800'
    }
  ]

  for (const combo of combos) {
    const { rows: existingProd } = await client.query('SELECT id FROM "Produto" WHERE "empresaId" = \$1 AND "nome" = \$2', [empresaId, combo.nome])
    
    if (existingProd.length === 0) {
      await client.query(
        'INSERT INTO "Produto" (id, "empresaId", nome, descricao, preco, imagem, disponivel, "categoriaId", "criadoEm") VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, NOW())',
        [uuidv4(), empresaId, combo.nome, combo.descricao, combo.preco, combo.imagem, true, categoriaId]
      )
      console.log(`Produto "${combo.nome}" criado.`)
    } else {
      console.log(`Produto "${combo.nome}" já existe.`)
    }
  }
  
  await client.end()
  console.log('Processo finalizado com sucesso!')
}

main().catch(async (e) => {
  console.error(e)
  if (client) await client.end()
})
