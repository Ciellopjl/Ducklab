const fs = require('fs');
const path = require('path');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git', '.vscode', 'public', 'infra', 'scripts'].includes(file)) {
        getFiles(fullPath, filesList);
      }
    } else {
      if (
        fullPath.match(/\.(ts|tsx|js|jsx|json|md|prisma|css|mjs)$/) && 
        !fullPath.includes('package-lock.json') &&
        !fullPath.includes('.env')
      ) {
        filesList.push(fullPath);
      }
    }
  }
  return filesList;
}

const allFiles = getFiles('./');
let output = 'Abaixo está todo o código-fonte principal do meu sistema completo, sem variáveis de ambiente.\n';

for (const file of allFiles) {
  output += '\n\n=========================================\n';
  output += `Arquivo: ${file}\n`;
  output += '=========================================\n\n';
  output += fs.readFileSync(file, 'utf-8');
}

fs.writeFileSync('prompt_completo_projeto.txt', output);
console.log('Arquivo gerado! Agora tem ' + allFiles.length + ' arquivos.');
