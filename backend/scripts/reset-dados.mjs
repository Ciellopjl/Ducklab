import pg from 'pg'
import { config } from 'dotenv'

// Carregar variáveis do .env
config()

const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no .env')
  process.exit(1)
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  await client.connect()
  console.log('🔗 Conectado ao banco de dados.\n')

  // Contar antes
  const { rows: [{ count: totalPedidos }] } = await client.query('SELECT COUNT(*) as count FROM "Pedido"')
  const { rows: [{ count: totalLogs }] } = await client.query('SELECT COUNT(*) as count FROM "Log"')

  console.log(`📊 Registros encontrados:`)
  console.log(`   - Pedidos: ${totalPedidos}`)
  console.log(`   - Logs: ${totalLogs}\n`)

  // Deletar logs primeiro (sem FK)
  await client.query('DELETE FROM "Log"')
  console.log(`✅ Logs deletados: ${totalLogs}`)

  // Deletar pedidos
  await client.query('DELETE FROM "Pedido"')
  console.log(`✅ Pedidos deletados: ${totalPedidos}`)

  console.log('\n🎉 Painel zerado e pronto para entrega ao cliente!')

  await client.end()
}

main().catch(async (e) => {
  console.error('❌ Erro:', e.message)
  await client.end()
  process.exit(1)
})
