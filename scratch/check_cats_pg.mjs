import pg from 'pg'
import { config } from 'dotenv'
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

  const { rows: categorias } = await client.query('SELECT * FROM "Categoria" WHERE "empresaId" = \$1', [empresaId])
  console.log('Categorias encontradas:', JSON.stringify(categorias, null, 2))
  
  await client.end()
}

main().catch(async (e) => {
  console.error(e)
  if (client) await client.end()
})
