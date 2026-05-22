require('dotenv').config()
const { prisma } = require('../src/lib/prisma')

async function main() {
  console.log('🔥 Iniciando SEED COMPLETO da M.E BURGER...')

  // Limpar dados existentes
  await prisma.pedido.deleteMany()
  await prisma.produtoPreco.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.sabor.deleteMany()
  await prisma.tamanho.deleteMany()
  await prisma.adicional.deleteMany()
  await prisma.promocao.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.empresa.deleteMany()

  // 1. Criar Empresa
  const empresa = await prisma.empresa.create({
    data: {
      nome: 'M.E BURGER',
      slug: 'meburgue',
      logo: '/logo.png',
      whatsapp: '16996360597',
      corPrimaria: '#FF4D00',
      horarioAbertura: '18:00',
      horarioFechamento: '23:30',
      taxaEntrega: 5.00,
      endereco: 'Cesar Nhocancer 111, Cidade Jardim - SP',
    }
  })

  // 2. Criar Categorias
  const catBurgers = await prisma.categoria.create({
    data: { nome: 'burgers', label: '🍔 Burgers', icone: '🍔', empresaId: empresa.id }
  })
  const catCombos = await prisma.categoria.create({
    data: { nome: 'combos', label: '🍟 Combos', icone: '🎁', empresaId: empresa.id }
  })
  const catAcompanhamentos = await prisma.categoria.create({
    data: { nome: 'acompanhamentos', label: '🍟 Porções', icone: '🍟', empresaId: empresa.id }
  })
  const catBebidas = await prisma.categoria.create({
    data: { nome: 'bebidas', label: '🥤 Bebidas', icone: '🥤', empresaId: empresa.id }
  })

  // 3. Criar Adicionais (Ingredientes Extras)
  const adicionaisData = [
    { nome: 'Presunto', preco: 3.00 },
    { nome: 'Cheddar', preco: 3.50 },
    { nome: 'Queijo Mussarela', preco: 4.00 },
    { nome: 'Bacon', preco: 4.50 },
    { nome: 'Ovo', preco: 2.00 },
    { nome: 'Calabresa', preco: 4.00 },
    { nome: 'Hambúrguer (120g)', preco: 5.00 },
    { nome: 'Cebola Caramelizada', preco: 2.00 },
    { nome: 'Milho Verde', preco: 1.00 },
    { nome: 'Azeitona', preco: 2.00 },
    { nome: 'Catupiry', preco: 3.00 },
    { nome: 'Barbecue', preco: 3.00 },
    { nome: 'Queijo Coalho', preco: 3.00 },
  ]
  await Promise.all(adicionaisData.map(a => prisma.adicional.create({ data: { ...a, empresaId: empresa.id } })))

  // 4. Criar Hambúrgueres
  const burgers = [
    { 
      nome: '1-M.E BURGER CLÁSSICO', 
      preco: 17.00, 
      descricao: 'Pão brioche, hambúrguer de 120g, queijo cheddar. Simples, suculento e viciante.',
      imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800'
    },
    { 
      nome: '2-M.E BURGER TRADICIONAL', 
      preco: 18.00, 
      descricao: 'Pão brioche, hambúrguer de 120g, bacon, presunto, queijo mussarela e salada. O clássico que nunca falha.',
      imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800'
    },
    { 
      nome: '3-M.E BURGER DA CASA', 
      preco: 20.00, 
      descricao: 'Pão brioche, hambúrguer de 120g, queijo cheddar, rúcula, tomate, cebola caramelizada e molho barbecue. O queridinho da casa!',
      imagem: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800'
    },
    { 
      nome: '4-M.E BURGER EGG BACON', 
      preco: 21.00, 
      descricao: 'Pão brioche, hambúrguer de 120g, queijo cheddar, ovo, bacon crocante e maionese da casa. Equilíbrio perfeito entre sabor e suculência.',
      imagem: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?q=80&w=800'
    },
    { 
      nome: '5-M.E BURGER PREMIUM CALABRESA', 
      preco: 21.00, 
      descricao: 'Pão brioche, hambúrguer de 120g, calabresa, milho verde, presunto, queijo mussarela derretido e salada. Recheio farto e sabor marcante.',
      imagem: 'https://images.unsplash.com/photo-1582196016295-f8c89433720e?q=80&w=800'
    },
    { 
      nome: '6-M.E BURGER INVICTO', 
      preco: 22.00, 
      descricao: 'Pão brioche, hambúrguer de 120g, tomate em cubos, queijo mussarela derretido, bacon picado, azeitona, presunto, ovo e muito molho especial. Para quem gosta de tudo junto.',
      imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800'
    },
    { 
      nome: '7-M.E BURGER MEL E QUEIJO', 
      preco: 23.00, 
      descricao: 'Pão brioche, hambúrguer de 140g, queijo coalho passado no mel e bacon crocante. Doce, salgado e surpreendente.',
      imagem: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=800'
    },
    { 
      nome: '8-M.E BURGER MAX DUPLO', 
      preco: 24.00, 
      descricao: 'Pão brioche, 2 smash de 120g, queijo cheddar, bacon e cebola caramelizada. Dois smash, duas vezes mais sabor.',
      imagem: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?q=80&w=800'
    },
    { 
      nome: '9-M.E BURGER MAX TRIPLO', 
      preco: 29.00, 
      descricao: 'Pão brioche, 3 smash de 120g, queijo cheddar, bacon e cebola caramelizada. Só pra quem aguenta.',
      imagem: 'https://images.unsplash.com/photo-1534790566855-4cb788d389ec?q=80&w=800'
    },
  ]

  for (const b of burgers) {
    await prisma.produto.create({
      data: { ...b, categoriaId: catBurgers.id, empresaId: empresa.id }
    })
  }

  // 5. Criar Combos
  const combos = [
    { 
      nome: 'COMBO CLÁSSICO - INDIVIDUAL', 
      preco: 28.00, 
      descricao: '1 M.E Burger Clássico + 1 Batata 150g + 1 Refrigerante lata. Perfeito para matar a fome sozinho!',
      imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800'
    },
    { 
      nome: 'COMBO TRADICIONAL - INDIVIDUAL', 
      preco: 29.00, 
      descricao: '1 M.E Burger Tradicional + 1 Batata 150g + 1 Refrigerante lata. Clássico e delicioso.',
      imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800'
    },
    { 
      nome: 'COMBO DA CASA - INDIVIDUAL', 
      preco: 31.00, 
      descricao: '1 M.E Burger da Casa + 1 Batata 150g + 1 Refrigerante lata. Nosso carro-chefe!',
      imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800'
    },
    { 
      nome: 'COMBO EGG BACON - INDIVIDUAL', 
      preco: 33.00, 
      descricao: '1 M.E Burger Egg Bacon + 1 Batata 150g + 1 Refrigerante lata. Sabor premium!',
      imagem: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?q=80&w=800'
    },
  ]

  for (const c of combos) {
    await prisma.produto.create({
      data: { ...c, categoriaId: catCombos.id, empresaId: empresa.id }
    })
  }

  // 6. Criar Porções
  await prisma.produto.create({
    data: { 
      nome: 'PORÇÃO DE BATATA FRITA', 
      preco: 9.00, 
      descricao: '150g de batata frita sequinha e crocante.', 
      imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800',
      categoriaId: catAcompanhamentos.id,
      empresaId: empresa.id
    }
  })

  // 7. Criar Bebidas
  const bebidas = [
    { nome: 'Refrigerante Lata (350ml)', preco: 6.00, descricao: 'Coca-cola, Guaraná, Fanta, etc.' },
    { nome: 'Coca-Cola 1 Litro', preco: 10.00, descricao: 'Refrescante para dividir.' },
    { nome: 'Refrigerante 1 Litro (Outros)', preco: 9.00, descricao: 'Guaraná, Fanta ou outros sabores.' },
  ]
  for (const b of bebidas) {
    await prisma.produto.create({
      data: { 
        ...b, 
        imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400',
        categoriaId: catBebidas.id, 
        empresaId: empresa.id 
      }
    })
  }

  console.log('✅ SEED M.E BURGER FINALIZADO!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
