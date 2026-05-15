import { prisma } from "../../src/lib/prisma";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function unlock() {
  const email = (process.env.ADMIN_EMAIL || "ciellolisboa023@gmail.com").toLowerCase();
  console.log(`Liberando acesso mestre para: ${email}`);

  try {
    // 1. Garantir que o usuário existe no banco
    const user = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: { email }
    });

    // 2. Buscar todas as empresas existentes
    const empresas = await prisma.empresa.findMany({ select: { id: true, nome: true } });

    if (empresas.length === 0) {
      console.log("⚠️  Nenhuma empresa encontrada. Crie uma empresa no onboarding antes de rodar este script.");
    } else {
      // 3. Para cada empresa, garantir que o usuário é BOSS
      for (const empresa of empresas) {
        await prisma.empresaUsuario.upsert({
          where: { empresaId_usuarioId: { empresaId: empresa.id, usuarioId: user.id } },
          update: { role: "BOSS" },
          create: { empresaId: empresa.id, usuarioId: user.id, role: "BOSS" }
        });
        console.log(`✅ Vínculo BOSS criado/atualizado para a empresa: ${empresa.nome} (${empresa.id})`);
      }
    }

    console.log("✅ SUCESSO! Usuário BOSS inserido/atualizado.");
    console.log(`ID do Usuário: ${user.id}`);
  } catch (err: any) {
    console.log("❌ ERRO AO INSERIR NO BANCO:");
    console.log(err.message);
  }
}

unlock();
