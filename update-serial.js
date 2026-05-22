const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Gera serial igual do utils
function generateSerial() {
  const bytes = crypto.randomBytes(8);
  const hex = bytes.toString('hex').toUpperCase();
  return ['DUCK', hex.slice(0, 4), hex.slice(4, 8), hex.slice(8, 12), hex.slice(12, 16)].join('-');
}

const serial = generateSerial();
console.log('NOVO_SERIAL:', serial);

const hash = bcrypt.hashSync(serial, 10);

const envPath = '.env';
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/ADMIN_PASSWORD_HASH=.*/g, `ADMIN_PASSWORD_HASH=${hash}`);
fs.writeFileSync(envPath, envContent);

console.log('HASH ATUALIZADO.');
