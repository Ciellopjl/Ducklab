import { prisma } from "../../src/lib/prisma";

async function inspect() {
  console.log("--- INSPEÇÃO PRISMA ---");
  const modelNames = Object.keys(prisma).filter(key => !key.startsWith('_') && typeof (prisma as any)[key] === 'object');
  console.log("Modelos detectados no objeto prisma:");
  console.log(modelNames.join(", "));
  
  if ((prisma as any).usuario) {
    console.log("✅ Modelo 'usuario' ENCONTRADO.");
  } else {
    console.log("❌ Modelo 'usuario' NÃO ENCONTRADO no objeto prisma atual!");
  }
  console.log("------------------------");
}

inspect();
