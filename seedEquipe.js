const { prisma } = require('./src/lib/prisma');

async function main() {
  await prisma.equipe.createMany({
    data: [
      {
        nome: 'Ana Silva',
        cargo: 'Founder & CEO',
        descricao: 'Líder visionária da Ducklab.',
        imagem: '/team/ana.jpg',
        ordem: 1,
        github: null,
        linkedin: 'https://linkedin.com/in/anasilva',
        instagram: null,
      },
      {
        nome: 'Carlos Pereira',
        cargo: 'Head of Design',
        descricao: 'Especialista em UI/UX e branding.',
        imagem: '/team/carlos.jpg',
        ordem: 2,
        github: null,
        linkedin: 'https://linkedin.com/in/carlospereira',
        instagram: null,
      },
      {
        nome: 'Mariana Costa',
        cargo: 'Full‑Stack Developer',
        descricao: 'Constrói plataformas robustas e escaláveis.',
        imagem: '/team/mariana.jpg',
        ordem: 3,
        github: 'https://github.com/marianacosta',
        linkedin: null,
        instagram: null,
      }
    ],
    skipDuplicates: true,
  });
  console.log('✅ Equipe seed data inserida');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao semear Equipe:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
