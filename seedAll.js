const { prisma } = require('./src/lib/prisma');

async function main() {
  console.log('Iniciando o seed completo...');

  // 1. Criar ou obter a Empresa Padrão (Ducklab)
  let empresa = await prisma.empresa.findUnique({
    where: { slug: 'ducklab' }
  });

  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        nome: 'Ducklab',
        slug: 'ducklab',
        logo: '/logo-duck.png',
        corPrimaria: '#00EB69',
      }
    });
    console.log('✅ Empresa padrão Ducklab criada');
  } else {
    console.log('ℹ️ Empresa padrão Ducklab já existe');
  }

  // 2. Semear Equipe com fotos reais de alta qualidade (Unsplash)
  console.log('Semeando equipe...');
  await prisma.equipe.deleteMany({}); // Limpa a equipe anterior
  await prisma.equipe.createMany({
    data: [
      {
        nome: 'Ana Silva',
        cargo: 'Founder & CEO',
        descricao: 'Líder visionária com mais de 10 anos de experiência em estratégia de negócios digitais.',
        imagem: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        ordem: 1,
        linkedin: 'https://linkedin.com/in/anasilva',
      },
      {
        nome: 'Carlos Pereira',
        cargo: 'Head of Design',
        descricao: 'Diretor de arte e especialista em UI/UX, criando interfaces memoráveis e intuitivas.',
        imagem: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
        ordem: 2,
        linkedin: 'https://linkedin.com/in/carlospereira',
      },
      {
        nome: 'Mariana Costa',
        cargo: 'Full-Stack Developer',
        descricao: 'Engenheira de software focada em arquiteturas modernas de alta performance como Next.js.',
        imagem: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        ordem: 3,
        github: 'https://github.com/marianacosta',
      }
    ]
  });
  console.log('✅ Dados de equipe inseridos');

  // 3. Semear Projetos com imagens premium reais (Unsplash)
  console.log('Semeando projetos...');
  await prisma.projeto.deleteMany({}); // Limpa projetos anteriores
  await prisma.projeto.createMany({
    data: [
      {
        empresaId: empresa.id,
        titulo: 'Portal TechVanguard',
        categoria: 'Website',
        descricao: 'Plataforma institucional de alta performance construída com Next.js, React Server Components e TailwindCSS para uma das maiores consultorias de tecnologia.',
        imagem: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        link: 'https://github.com',
        data: '12/03/2026',
        ordem: 1,
        destaque: true,
      },
      {
        empresaId: empresa.id,
        titulo: 'E-commerce GlowCosmetics',
        categoria: 'E-commerce',
        descricao: 'Loja virtual de cosméticos com foco em conversão e experiência mobile premium, integrada com gateway de pagamentos modernos e painel administrativo sob medida.',
        imagem: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        link: 'https://github.com',
        data: '22/04/2026',
        ordem: 2,
        destaque: true,
      },
      {
        empresaId: empresa.id,
        titulo: 'Identidade Visual ApexFinance',
        categoria: 'Branding',
        descricao: 'Desenvolvimento de marca completa, incluindo logotipo, manual de marca, tipografia e design de papelaria premium para fintech de investimentos internacional.',
        imagem: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80',
        link: 'https://behance.net',
        data: '05/05/2026',
        ordem: 3,
        destaque: true,
      }
    ]
  });
  console.log('✅ Dados de projetos inseridos');
  console.log('Todas as etapas concluídas com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
