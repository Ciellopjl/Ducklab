import { config } from 'dotenv'
config()

// O Neon Serverless Driver usa HTTP (não TCP) para executar queries
// Isso contorna o bloqueio de conexão por quota excedida
import { neon } from '@neondatabase/serverless'

async function main() {
  console.log('🚀 Conectando via Neon Serverless Driver (HTTP)...')
  
  const sql = neon(process.env.DATABASE_URL)
  
  // Primeiro verifica quantas imagens existem
  const countResult = await sql`SELECT COUNT(*) as count FROM "Galeria"`
  const count = parseInt(countResult[0].count)
  console.log(`📦 Imagens na Galeria: ${count}`)
  
  if (count > 0) {
    const result = await sql`DELETE FROM "Galeria"`
    console.log(`✅ ${count} imagens removidas da Galeria!`)
    console.log('🎉 Banco limpo! O painel vai funcionar normalmente agora.')
  } else {
    console.log('✅ Galeria já está vazia.')
  }
}

main().catch(e => {
  console.error('❌ Erro:', e.message)
  console.log('\n📋 Solução manual no console.neon.tech → SQL Editor:')
  console.log('  DELETE FROM "Galeria";')
})
