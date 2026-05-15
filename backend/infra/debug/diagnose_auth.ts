import { prisma } from "../../src/lib/prisma";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function diagnose() {
  console.log("--- DIAGNÓSTICO DE ACESSO ---");
  const adminEnv = process.env.ADMIN_EMAIL;
  const hardcoded = "ciellolisboa023@gmail.com";
  
  console.log(`E-mail no ENV: [${adminEnv}]`);
  console.log(`E-mail Alvo:   [${hardcoded}]`);
  
  if (adminEnv?.toLowerCase().trim() === hardcoded.toLowerCase()) {
    console.log("✅ E-mail configurado corretamente no .env.local");
  } else {
    console.log("❌ E-mail no .env.local NÃO coincide com o esperado!");
  }

  try {
    const userCount = await prisma.usuario.count();
    console.log(`✅ Conexão com Banco OK. Usuários cadastrados: ${userCount}`);
    
    const boss = await prisma.usuario.findUnique({
      where: { email: hardcoded },
      include: {
        empresas: true // relação EmpresaUsuario
      }
    });
    
    if (boss) {
      const roleInfo = boss.empresas.map(e => `empresaId=${e.empresaId} role=${e.role}`).join(', ');
      console.log(`✅ Usuário encontrado. Vínculos de empresa: ${roleInfo || 'nenhum'}`);
    } else {
      console.log("⚠️  Usuário ainda não está no banco (será criado no primeiro login).");
    }
  } catch (err: any) {
    console.log("❌ ERRO AO ACESSAR BANCO:");
    console.log(err.message);
  }
  console.log("----------------------------");
}

diagnose();
