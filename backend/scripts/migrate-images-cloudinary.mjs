/**
 * Script de migração: sobe as imagens locais /uploads/* para o Cloudinary
 * e atualiza as URLs no banco de dados.
 *
 * USO:
 *   1. Preencha as credenciais do Cloudinary no .env
 *   2. Execute: node scripts/migrate-images-cloudinary.mjs
 */

import pg from 'pg'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config() // carrega .env

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FOLDER = 'meburger'
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

/**
 * Faz upload de um arquivo local para o Cloudinary e retorna a URL segura.
 */
async function uploadLocalFile(localPath) {
  const result = await cloudinary.uploader.upload(localPath, {
    folder:        FOLDER,
    resource_type: 'image',
    quality:       'auto',
    fetch_format:  'auto',
  })
  return result.secure_url
}

/**
 * Resolve a URL de uma imagem.
 * - Se já for https://, retorna sem alterar.
 * - Se for /uploads/... e existir localmente, sobe para o Cloudinary.
 * - Se o arquivo local não existir, mantém o valor original.
 */
async function resolveImage(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('http')) return imageUrl

  const localPath = path.join(PUBLIC_DIR, imageUrl)
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠️  Não encontrado localmente: ${imageUrl}`)
    return imageUrl
  }

  console.log(`  ⬆️  Subindo: ${imageUrl}`)
  const newUrl = await uploadLocalFile(localPath)
  console.log(`  ✅  → ${newUrl}`)
  return newUrl
}

async function migrar() {
  console.log('\n🚀 Iniciando migração de imagens para Cloudinary...')
  console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`)

  await client.connect()
  console.log('✅ Banco conectado\n')

  // ── 1. Migra imagens dos produtos ──────────────────────────────────────────
  const { rows: produtos } = await client.query(
    'SELECT id, imagem FROM "Produto" WHERE imagem IS NOT NULL AND imagem != \'\''
  )

  console.log(`📦 ${produtos.length} produtos encontrados...`)
  let totalProdutos = 0

  for (const p of produtos) {
    const novaUrl = await resolveImage(p.imagem)
    if (novaUrl !== p.imagem) {
      await client.query('UPDATE "Produto" SET imagem = $1 WHERE id = $2', [novaUrl, p.id])
      totalProdutos++
    }
  }
  console.log(`\n✅ ${totalProdutos}/${produtos.length} produtos migrados.\n`)

  // ── 2. Migra logos das empresas ────────────────────────────────────────────
  const { rows: empresas } = await client.query(
    'SELECT id, logo FROM "Empresa" WHERE logo IS NOT NULL AND logo != \'\''
  )

  console.log(`🏪 ${empresas.length} empresas encontradas...`)
  let totalEmpresas = 0

  for (const e of empresas) {
    const novaUrl = await resolveImage(e.logo)
    if (novaUrl !== e.logo) {
      await client.query('UPDATE "Empresa" SET logo = $1 WHERE id = $2', [novaUrl, e.id])
      totalEmpresas++
    }
  }
  console.log(`✅ ${totalEmpresas}/${empresas.length} logos migrados.\n`)

  console.log('='.repeat(50))
  console.log('🎉 Migração concluída!')
  console.log(`   Produtos: ${totalProdutos} | Empresas: ${totalEmpresas}`)
  console.log('='.repeat(50))
  console.log('\n👉 Próximo passo: adicione as variáveis Cloudinary na Vercel e faça deploy!\n')
}

migrar()
  .catch(e => {
    console.error('❌ Erro fatal:', e.message)
    process.exit(1)
  })
  .finally(() => client.end())
