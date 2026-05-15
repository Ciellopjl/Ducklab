import pg from 'pg'
import { config } from 'dotenv'
config()

// Usa a URL de conexão direto (não-pooler) para evitar problemas de quota do adapter
const connectionString = process.env.DATABASE_URL

const { Client } = pg

async function main() {
  console.log('🔗 Conectando ao banco...')
  
  // Tenta com SSL desabilitado como último recurso
  const client = new Client({
    connectionString,
    ssl: false,
  })
  
  try {
    await client.connect()
  } catch (e1) {
    console.log('Tentativa 1 falhou, tentando com SSL...')
    const client2 = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
    await client2.connect()
    
    const { rowCount } = await client2.query('DELETE FROM "Galeria"')
    console.log(`✅ ${rowCount} registros removidos da Galeria.`)
    await client2.end()
    return
  }

  const { rowCount } = await client.query('DELETE FROM "Galeria"')
  console.log(`✅ ${rowCount} registros removidos da Galeria.`)
  console.log('🎉 Banco limpo! O painel vai funcionar normalmente agora.')
  await client.end()
}

main().catch(async (e) => {
  console.error('❌ Erro:', e.message)
  console.log('')
  console.log('⚠️  O banco está bloqueando conexões devido ao limite de quota do Neon.')
  console.log('Para resolver AGORA, acesse: https://console.neon.tech')
  console.log('Vá em SQL Editor e execute:')
  console.log('')
  console.log('  DELETE FROM "Galeria";')
  console.log('')
  console.log('Isso vai resolver o problema imediatamente.')
})
