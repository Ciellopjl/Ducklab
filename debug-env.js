// Debug: verifica exatamente o que o dotenv lê do .env
require('dotenv').config();
const hash = process.env.ADMIN_PASSWORD_HASH;
console.log('Hash lido pelo dotenv:', JSON.stringify(hash));
console.log('Tamanho:', hash ? hash.length : 'undefined');

// Agora testa com dotenv-expand (como Next.js faz)
const dotenv = require('dotenv');
const dotenvExpand = require('@next/env');
// Alternativa: carrega como Next.js faria
delete require.cache; // limpa cache
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
console.log('\n--- Conteúdo raw do .env (linha ADMIN_PASSWORD_HASH) ---');
envContent.split('\n').forEach(line => {
  if (line.includes('ADMIN_PASSWORD_HASH')) {
    console.log('Raw:', JSON.stringify(line));
  }
});

// Testa bcrypt com o valor lido
const bcrypt = require('bcryptjs');
if (hash) {
  bcrypt.compare('admin123', hash).then(result => {
    console.log('\nbcrypt.compare("admin123", hash):', result);
    if (!result) {
      console.log('PROBLEMA: O hash lido pelo dotenv NAO bate com admin123');
      console.log('Isso indica que o dotenv-expand esta corrompendo o hash');
    }
  });
}
