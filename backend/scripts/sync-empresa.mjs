import pg from 'pg'
import { config } from 'dotenv'
config()

const { Client } = pg
const adminEmail = process.env.ADMIN_EMAIL

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  console.log('✅ Conectado\n')

  // 1. Estado completo da empresa
  const { rows: [empresa] } = await client.query('SELECT * FROM "Empresa" LIMIT 1')
  console.log('🏢 EMPRESA:')
  console.log(`   Nome:     ${empresa.nome}`)
  console.log(`   Slug:     ${empresa.slug}`)
  console.log(`   WhatsApp: ${empresa.whatsapp}`)
  console.log(`   Abertura: ${empresa.horarioAbertura} - ${empresa.horarioFechamento}`)
  console.log(`   Entrega:  R$ ${empresa.taxaEntrega}`)
  console.log(`   Endereço: ${empresa.endereco}`)
  console.log(`   Logo:     ${empresa.logo}`)

  // 2. Produtos por categoria
  const { rows: categorias } = await client.query(
    'SELECT id, label, nome FROM "Categoria" WHERE "empresaId" = $1 ORDER BY label', [empresa.id]
  )
  console.log('\n📂 CATEGORIAS E PRODUTOS:')
  for (const cat of categorias) {
    const { rows: prods } = await client.query(
      'SELECT nome, preco, disponivel FROM "Produto" WHERE "categoriaId" = $1 ORDER BY nome',
      [cat.id]
    )
    console.log(`\n  ${cat.label} (${prods.length} produtos):`)
    prods.forEach(p => console.log(`    - ${p.nome} | R$ ${parseFloat(p.preco).toFixed(2)} | ${p.disponivel ? 'ativo' : 'INATIVO'}`))
  }

  // 3. Adicionais
  const { rows: adicionais } = await client.query(
    'SELECT nome, preco FROM "Adicional" WHERE "empresaId" = $1 ORDER BY nome', [empresa.id]
  )
  console.log(`\n🧀 ADICIONAIS (${adicionais.length}):`)
  adicionais.forEach(a => console.log(`  - ${a.nome} | R$ ${parseFloat(a.preco).toFixed(2)}`))

  // 4. Usuário admin
  const { rows: usuario } = await client.query('SELECT id, email FROM "Usuario" WHERE email = $1', [adminEmail])
  console.log(`\n👤 ADMIN: ${adminEmail} | ${usuario.length > 0 ? '✅ cadastrado' : '❌ NÃO encontrado'}`)

  // 5. Garantir usuário admin + vínculo BOSS
  let usuarioId
  if (usuario.length === 0) {
    const { rows: [novo] } = await client.query(
      'INSERT INTO "Usuario" (id, email, "criadoEm") VALUES (gen_random_uuid(), $1, NOW()) RETURNING id',
      [adminEmail]
    )
    usuarioId = novo.id
    console.log(`   ✅ Usuário admin criado`)
  } else {
    usuarioId = usuario[0].id
  }

  const { rows: vinculo } = await client.query(
    'SELECT id, role FROM "EmpresaUsuario" WHERE "empresaId" = $1 AND "usuarioId" = $2',
    [empresa.id, usuarioId]
  )

  if (vinculo.length === 0) {
    await client.query(
      'INSERT INTO "EmpresaUsuario" (id, "empresaId", "usuarioId", role, "criadoEm") VALUES (gen_random_uuid(), $1, $2, $3, NOW())',
      [empresa.id, usuarioId, 'BOSS']
    )
    console.log(`   ✅ Vínculo BOSS criado`)
  } else {
    // Garantir que é BOSS
    await client.query(
      'UPDATE "EmpresaUsuario" SET role = $1 WHERE "empresaId" = $2 AND "usuarioId" = $3',
      ['BOSS', empresa.id, usuarioId]
    )
    console.log(`   ✅ Vínculo BOSS confirmado`)
  }

  // 6. Limpar RevokedSessions (para garantir que o admin pode fazer login)
  await client.query('DELETE FROM "RevokedSession"')
  console.log(`   ✅ Sessões revogadas limpas`)

  // 7. Resumo
  const { rows: [totalProd] } = await client.query('SELECT COUNT(*) as c FROM "Produto"')
  const { rows: [totalCat] } = await client.query('SELECT COUNT(*) as c FROM "Categoria"')
  const { rows: [totalAd] } = await client.query('SELECT COUNT(*) as c FROM "Adicional"')

  console.log('\n' + '='.repeat(50))
  console.log('🎉 SINCRONIZAÇÃO COMPLETA!')
  console.log(`   Produtos:   ${totalProd.c}`)
  console.log(`   Categorias: ${totalCat.c}`)
  console.log(`   Adicionais: ${totalAd.c}`)
  console.log(`   Admin:      ${adminEmail} (BOSS)`)
  console.log('='.repeat(50))
  console.log('\n⚠️  IMPORTANTE: Faça logout e login novamente no painel!')
  console.log('   Acesse: http://localhost:3000/admin')

  await client.end()
}

main().catch(e => {
  console.error('❌ Erro:', e.message)
  process.exit(1)
})
