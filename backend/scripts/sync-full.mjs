import pg from 'pg'
import { config } from 'dotenv'
config()

const { Client } = pg

// Todos os dados do M.E BURGER - COMPLETO
const DADOS_MEBURGER = {
  empresa: {
    nome: 'M.E BURGER',
    slug: 'meburgue',
    logo: '/logo.png',
    whatsapp: '16996360597',
    corPrimaria: '#FF4D00',
    horarioAbertura: '18:00',
    horarioFechamento: '23:30',
    taxaEntrega: 5.00,
    endereco: 'Cesar Nhocancer 111, Cidade Jardim - SP',
  },
  categorias: [
    { nome: 'burgers',         label: '🍔 Burgers',             icone: '🍔', adicionaisHabilitados: true },
    { nome: 'combos',          label: '🍟 Combos Imperdíveis',  icone: '🎁', adicionaisHabilitados: false },
    { nome: 'acompanhamentos', label: '🍟 Porções',             icone: '🍟', adicionaisHabilitados: false },
    { nome: 'bebidas',         label: '🥤 Bebidas',             icone: '🥤', adicionaisHabilitados: false },
  ],
  adicionais: [
    { nome: 'Presunto',           preco: 3.00 },
    { nome: 'Cheddar',            preco: 3.50 },
    { nome: 'Queijo Mussarela',   preco: 4.00 },
    { nome: 'Bacon',              preco: 4.50 },
    { nome: 'Ovo',                preco: 2.00 },
    { nome: 'Calabresa',          preco: 4.00 },
    { nome: 'Hambúrguer (120g)',   preco: 5.00 },
    { nome: 'Cebola Caramelizada',preco: 2.00 },
    { nome: 'Milho Verde',        preco: 1.00 },
    { nome: 'Azeitona',           preco: 2.00 },
    { nome: 'Catupiry',           preco: 3.00 },
    { nome: 'Barbecue',           preco: 3.00 },
    { nome: 'Queijo Coalho',      preco: 3.00 },
  ],
  produtos: {
    burgers: [
      { nome: '1-M.E BURGER CLÁSSICO',           preco: 17.00, descricao: 'Pão brioche, hambúrguer de 120g, queijo cheddar. Simples, suculento e viciante.', imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800' },
      { nome: '2-M.E BURGER TRADICIONAL',         preco: 18.00, descricao: 'Pão brioche, hambúrguer de 120g, bacon, presunto, queijo mussarela e salada. O clássico que nunca falha.', imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800' },
      { nome: '3-M.E BURGER DA CASA',             preco: 20.00, descricao: 'Pão brioche, hambúrguer de 120g, queijo cheddar, rúcula, tomate, cebola caramelizada e molho barbecue. O queridinho da casa!', imagem: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800' },
      { nome: '4-M.E BURGER EGG BACON',           preco: 21.00, descricao: 'Pão brioche, hambúrguer de 120g, queijo cheddar, ovo, bacon crocante e maionese da casa. Equilíbrio perfeito entre sabor e suculência.', imagem: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?q=80&w=800' },
      { nome: '5-M.E BURGER PREMIUM CALABRESA',   preco: 21.00, descricao: 'Pão brioche, hambúrguer de 120g, calabresa, milho verde, presunto, queijo mussarela derretido e salada. Recheio farto e sabor marcante.', imagem: 'https://images.unsplash.com/photo-1582196016295-f8c89433720e?q=80&w=800' },
      { nome: '6-M.E BURGER INVICTO',             preco: 22.00, descricao: 'Pão brioche, hambúrguer de 120g, tomate em cubos, queijo mussarela derretido, bacon picado, azeitona, presunto, ovo e muito molho especial.', imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800' },
      { nome: '7-M.E BURGER MEL E QUEIJO',        preco: 23.00, descricao: 'Pão brioche, hambúrguer de 140g, queijo coalho passado no mel e bacon crocante. Doce, salgado e surpreendente.', imagem: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=800' },
      { nome: '8-M.E BURGER MAX DUPLO',           preco: 24.00, descricao: 'Pão brioche, 2 smash de 120g, queijo cheddar, bacon e cebola caramelizada. Dois smash, duas vezes mais sabor.', imagem: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?q=80&w=800' },
      { nome: '9-M.E BURGER MAX TRIPLO',          preco: 29.00, descricao: 'Pão brioche, 3 smash de 120g, queijo cheddar, bacon e cebola caramelizada. Só pra quem aguenta.', imagem: 'https://images.unsplash.com/photo-1534790566855-4cb788d389ec?q=80&w=800' },
    ],
    combos: [
      { nome: 'COMBO CLÁSSICO',        preco: 28.00, descricao: '1 M.E Burger Clássico + Batata Frita 150g + Refrigerante Lata. Perfeito para matar a fome!', imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800' },
      { nome: 'COMBO TRADICIONAL',     preco: 29.00, descricao: '1 M.E Burger Tradicional + Batata Frita 150g + Refrigerante Lata. Clássico e delicioso.', imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800' },
      { nome: 'COMBO DA CASA',         preco: 31.00, descricao: '1 M.E Burger da Casa + Batata Frita 150g + Refrigerante Lata. Nosso carro-chefe!', imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800' },
      { nome: 'COMBO EGG BACON',       preco: 33.00, descricao: '1 M.E Burger Egg Bacon + Batata Frita 150g + Refrigerante Lata. Sabor premium!', imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800' },
      { nome: 'COMBO DUPLO SMASH',     preco: 55.00, descricao: '2 M.E Burgers Clássicos + Batata Frita G + 2 Refrigerantes Lata. Ideal para dividir!', imagem: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800' },
      { nome: 'COMBO FAMÍLIA',         preco: 95.00, descricao: '4 Burgers à escolha + 2 Batatas Fritas G + Coca-Cola 2L. A festa completa!', imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800' },
    ],
    acompanhamentos: [
      { nome: 'PORÇÃO DE BATATA FRITA P',  preco:  9.00, descricao: '150g de batata frita sequinha e crocante.', imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800' },
      { nome: 'PORÇÃO DE BATATA FRITA G',  preco: 14.00, descricao: '300g de batata frita sequinha e crocante.', imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800' },
      { nome: 'PORÇÃO DE BATATA COM CHEDDAR E BACON', preco: 18.00, descricao: 'Batata frita coberta com cheddar cremoso e bacon crocante. Irresistível!', imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800' },
    ],
    bebidas: [
      { nome: 'Refrigerante Lata (350ml)',     preco:  6.00, descricao: 'Coca-Cola, Guaraná, Fanta ou Sprite.',    imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
      { nome: 'Coca-Cola 1 Litro',             preco: 10.00, descricao: 'Refrescante para dividir.',               imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
      { nome: 'Coca-Cola 2 Litros',            preco: 14.00, descricao: 'Para a turma toda.',                      imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
      { nome: 'Refrigerante 1 Litro (Outros)', preco:  9.00, descricao: 'Guaraná, Fanta ou outros sabores.',       imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
      { nome: 'Água Mineral (500ml)',           preco:  3.00, descricao: 'Água mineral sem gás.',                   imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
      { nome: 'Suco Natural (400ml)',           preco:  8.00, descricao: 'Laranja, limão ou maracujá. Feito na hora.', imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
    ],
  }
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  console.log('✅ Conectado\n')

  // 1. Pega empresa
  const { rows: [empresa] } = await client.query('SELECT id FROM "Empresa" WHERE slug = $1', [DADOS_MEBURGER.empresa.slug])
  if (!empresa) {
    console.error('❌ Empresa "meburgue" não encontrada!')
    return
  }
  const empresaId = empresa.id

  // 2. Atualiza dados da empresa
  await client.query(`
    UPDATE "Empresa" SET
      nome = $1, logo = $2, whatsapp = $3, "corPrimaria" = $4,
      "horarioAbertura" = $5, "horarioFechamento" = $6,
      "taxaEntrega" = $7, endereco = $8
    WHERE id = $9
  `, [
    DADOS_MEBURGER.empresa.nome, DADOS_MEBURGER.empresa.logo,
    DADOS_MEBURGER.empresa.whatsapp, DADOS_MEBURGER.empresa.corPrimaria,
    DADOS_MEBURGER.empresa.horarioAbertura, DADOS_MEBURGER.empresa.horarioFechamento,
    DADOS_MEBURGER.empresa.taxaEntrega, DADOS_MEBURGER.empresa.endereco,
    empresaId
  ])
  console.log('✅ Dados da empresa atualizados')

  // 3. Sincroniza categorias e pega os IDs
  const catIds = {}
  for (const cat of DADOS_MEBURGER.categorias) {
    const { rows: existing } = await client.query(
      'SELECT id FROM "Categoria" WHERE "empresaId" = $1 AND nome = $2', [empresaId, cat.nome]
    )
    if (existing.length > 0) {
      // Atualiza label e icone
      await client.query(
        'UPDATE "Categoria" SET label = $1, icone = $2, "adicionaisHabilitados" = $3 WHERE id = $4',
        [cat.label, cat.icone, cat.adicionaisHabilitados, existing[0].id]
      )
      catIds[cat.nome] = existing[0].id
    } else {
      const { rows: [nova] } = await client.query(
        'INSERT INTO "Categoria" (id, "empresaId", nome, label, icone, "adicionaisHabilitados") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id',
        [empresaId, cat.nome, cat.label, cat.icone, cat.adicionaisHabilitados]
      )
      catIds[cat.nome] = nova.id
    }
    console.log(`  ✅ Categoria: ${cat.label}`)
  }

  // 4. Remove TODOS os produtos e recria do zero (garante consistência)
  await client.query('DELETE FROM "Produto" WHERE "empresaId" = $1', [empresaId])
  console.log('\n🗑️  Produtos antigos removidos. Recriando...')

  let totalCriados = 0
  for (const [catNome, produtos] of Object.entries(DADOS_MEBURGER.produtos)) {
    const catId = catIds[catNome]
    if (!catId) continue
    for (const prod of produtos) {
      await client.query(
        'INSERT INTO "Produto" (id, "empresaId", nome, descricao, preco, imagem, disponivel, "categoriaId", "criadoEm") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, $6, NOW())',
        [empresaId, prod.nome, prod.descricao, prod.preco, prod.imagem, catId]
      )
      totalCriados++
    }
    console.log(`  ✅ ${produtos.length} produtos criados em ${catNome}`)
  }

  // 5. Sincroniza adicionais
  await client.query('DELETE FROM "Adicional" WHERE "empresaId" = $1', [empresaId])
  for (const ad of DADOS_MEBURGER.adicionais) {
    await client.query(
      'INSERT INTO "Adicional" (id, "empresaId", nome, preco, disponivel) VALUES (gen_random_uuid(), $1, $2, $3, true)',
      [empresaId, ad.nome, ad.preco]
    )
  }
  console.log(`\n  ✅ ${DADOS_MEBURGER.adicionais.length} adicionais sincronizados`)

  console.log('\n' + '='.repeat(50))
  console.log(`🎉 SINCRONIZAÇÃO TOTAL CONCLUÍDA!`)
  console.log(`   Total de produtos: ${totalCriados}`)
  console.log(`   Categorias:        ${DADOS_MEBURGER.categorias.length}`)
  console.log(`   Adicionais:        ${DADOS_MEBURGER.adicionais.length}`)
  console.log('='.repeat(50))

  await client.end()
}

main().catch(e => {
  console.error('❌ Erro:', e.message)
  process.exit(1)
})
