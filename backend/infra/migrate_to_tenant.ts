import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Iniciando script de migração para Multi-Tenant...');

  // 1. Criar a empresa default para os dados existentes
  const empresaDefault = await prisma.empresa.upsert({
    where: { slug: 'mega-lanche-do-gangao' },
    update: {},
    create: {
      nome: 'M.E BURGER',
      slug: 'mega-lanche-do-gangao',
      corPrimaria: '#ef4444', 
    },
  });

  console.log(`Empresa default garantida: ${empresaDefault.id} - ${empresaDefault.nome}`);

  // 2. Associar Categorias à empresa default
  const categoriasAtualizadas = await prisma.categoria.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresaDefault.id },
  });
  console.log(`Categorias atualizadas: ${categoriasAtualizadas.count}`);

  // 3. Associar Produtos à empresa default
  const produtosAtualizados = await prisma.produto.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresaDefault.id },
  });
  console.log(`Produtos atualizados: ${produtosAtualizados.count}`);

  // 4. Associar Pedidos à empresa default
  const pedidosAtualizados = await prisma.pedido.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresaDefault.id },
  });
  console.log(`Pedidos atualizados: ${pedidosAtualizados.count}`);

  // 5. Associar Cupons à empresa default
  const cuponsAtualizados = await prisma.cupom.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresaDefault.id },
  });
  console.log(`Cupons atualizados: ${cuponsAtualizados.count}`);

  // 6. Associar Promocoes à empresa default
  const promocoesAtualizadas = await prisma.promocao.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresaDefault.id },
  });
  console.log(`Promoções atualizadas: ${promocoesAtualizadas.count}`);

  // 7. Associar Logs à empresa default
  const logsAtualizados = await prisma.log.updateMany({
    where: { empresaId: null },
    data: { empresaId: empresaDefault.id },
  });
  console.log(`Logs atualizados: ${logsAtualizados.count}`);

  // 8. Associar Usuários como BOSS na empresa
  // OBS: Anteriormente a role ficava no usuário. Se havia usuários criados, vamos torná-los BOSS
  // na EmpresaUsuario para garantir o acesso completo
  const usuarios = await prisma.usuario.findMany();
  let relacoesCriadas = 0;
  for (const user of usuarios) {
    // Usamos create ou upsert para a tabela de junção
    const relacaoExistente = await prisma.empresaUsuario.findUnique({
      where: {
        empresaId_usuarioId: {
          empresaId: empresaDefault.id,
          usuarioId: user.id
        }
      }
    });

    if (!relacaoExistente) {
      await prisma.empresaUsuario.create({
        data: {
          empresaId: empresaDefault.id,
          usuarioId: user.id,
          role: 'BOSS', // Migramos todos para BOSS no tenant original para não quebrar acesso
        }
      });
      relacoesCriadas++;
    }
  }
  console.log(`Relações EmpresaUsuario criadas: ${relacoesCriadas}`);

  console.log('Migração concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
