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
  
  const query = `
    SELECT 
      p.nome, 
      p.preco, 
      p."precoPromocional", 
      p."emPromocao", 
      c.nome as categoria_nome
    FROM "Produto" p
    LEFT JOIN "Categoria" c ON p."categoriaId" = c.id
    ORDER BY c.nome, p.nome
  `
  
  const { rows } = await client.query(query)
  
  console.log('--- LISTA DE PRODUTOS E PREÇOS ---\n')
  rows.forEach(p => {
    const precoFinal = p.emPromocao && p.precoPromocional > 0 ? p.precoPromocional : p.preco
    console.log(`🍔 ${p.nome.padEnd(30)} | ${p.categoria_nome?.padEnd(15)} | R$ ${precoFinal.toFixed(2)}${p.emPromocao ? ' (PROMO)' : ''}`)
  })
  
  await client.end()
}

main().catch(async (e) => {
  console.error(e)
  await client.end()
})
