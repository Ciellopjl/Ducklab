const fs = require('fs');
const path = require('path');
const ignoreDirs = ['node_modules', '.next', '.git'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!ignoreDirs.some(i => file.includes(i))) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.push('./tailwind.config.js');

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Hex colors
    content = content.replace(/#D4AF37/gi, '#7B2CBF') // Primary Gold -> Purple
                     .replace(/#F5D060/gi, '#39FF14') // Light Gold -> Neon Green
                     .replace(/#B8962E/gi, '#5A189A') // Dark Gold -> Dark Purple
                     .replace(/212,175,55/g, '123,44,191') // RGB Primary
                     .replace(/245,208,96/g, '57,255,20') // RGB Light
                     // Tailwind orange map overrides
                     .replace(/'#e7c04a'/g, "'#9D4EDD'")
                     .replace(/'#edd077'/g, "'#C77DFF'")
                     .replace(/'#f4e0a4'/g, "'#E0AAFF'")
                     .replace(/'#9b7d25'/g, "'#3C096C'")
                     .replace(/'#7e641c'/g, "'#240046'")
                     .replace(/'#614b13'/g, "'#10002B'");

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated Colors: ' + file);
    }
  }
});
