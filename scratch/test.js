const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const pedidos = await prisma.pedido.findMany({
    select: { id: true, serial: true, nomeCliente: true, telefone: true },
    take: 5,
    orderBy: { criadoEm: 'desc' }
  });
  console.log(JSON.stringify(pedidos, null, 2));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
