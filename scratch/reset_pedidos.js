const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Resetando faturamento (Deletando todos os pedidos)...');
  const result = await prisma.pedido.deleteMany({});
  console.log(`Sucesso: ${result.count} pedidos deletados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
