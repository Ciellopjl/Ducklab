const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});

async function main() {
  const email = 'ciellolisboa023@gmail.com';
  
  // 1. Buscar a empresa principal
  const empresaRes = await pool.query('SELECT id FROM "Empresa" WHERE slug = \'meburgue\' LIMIT 1');
  if (empresaRes.rows.length === 0) {
    console.log('Empresa meburgue não encontrada.');
    await pool.end();
    return;
  }
  const empresaId = empresaRes.rows[0].id;

  // 2. Buscar ou criar o usuário
  let usuarioId;
  const userRes = await pool.query('SELECT id FROM "Usuario" WHERE email = $1', [email]);
  
  if (userRes.rows.length === 0) {
    console.log('Usuário não encontrado, criando...');
    const insertRes = await pool.query('INSERT INTO "Usuario" (id, email, "criadoEm") VALUES (gen_random_uuid(), $1, NOW()) RETURNING id', [email]);
    usuarioId = insertRes.rows[0].id;
  } else {
    usuarioId = userRes.rows[0].id;
  }

  // 3. Vincular como BOSS na empresa
  console.log(`Vinculando ${email} como BOSS na empresa ${empresaId}...`);
  await pool.query(`
    INSERT INTO "EmpresaUsuario" (id, "empresaId", "usuarioId", role, "criadoEm")
    VALUES (gen_random_uuid(), $1, $2, 'BOSS', NOW())
    ON CONFLICT ("empresaId", "usuarioId") DO UPDATE SET role = 'BOSS'
  `, [empresaId, usuarioId]);

  console.log('✅ Usuário configurado como BOSS com sucesso!');
  await pool.end();
}

main().catch(console.error);
