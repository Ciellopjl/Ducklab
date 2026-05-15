const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});

async function main() {
  const res = await pool.query('SELECT nome, slug FROM "Empresa"');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

main().catch(console.error);
