const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();

    let out = "";
    try {
        const res = await client.query('SELECT * FROM "Empresa" limit 1');
        out += "SCHEMA OR DATA FOR Empresa:\n" + JSON.stringify(res.rows, null, 2) + "\n\n";

        if (res.rows.length > 0 && res.rows[0].nome === 'PedePorAqui') {
            await client.query('UPDATE "Empresa" SET nome = $1 WHERE id = $2', ['M.E BURGER', res.rows[0].id]);
            out += "Updated Empresa name!\n\n";
        }
    } catch (e) { out += "Empresa query failed: " + e.message + "\n\n"; }

    try {
        const res2 = await client.query('SELECT * FROM "Usuario" limit 5');
        out += "Usuarios:\n" + JSON.stringify(res2.rows, null, 2) + "\n\n";
    } catch (e) { out += "Usuario query failed: " + e.message + "\n\n"; }

    try {
        const res3 = await client.query('SELECT * FROM "EmpresaUsuario" limit 5');
        out += "EmpresaUsuarios:\n" + JSON.stringify(res3.rows, null, 2) + "\n\n";
    } catch (e) { out += "EmpresaUsuario query failed: " + e.message + "\n\n"; }

    await client.end();
    fs.writeFileSync('db_output.json', out);
}

main().catch(console.error);
