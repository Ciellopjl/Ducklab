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
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.push('./prisma/seed.ts', './tailwind.config.js');

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    content = content.replace(/Pizzaria Impperial/g, 'Donatello Pizza')
                     .replace(/Impperial \(Especial\)/g, 'Donatello (Especial)')
                     .replace(/Pizza Impperial/g, 'Pizza Donatello')
                     .replace(/Impperial Admin/g, 'Donatello Admin')
                     .replace(/Sistema Impperial/g, 'Sistema Donatello')
                     .replace(/slug: 'impperial'/g, "slug: 'donatello'")
                     .replace(/redirect\('\/impperial'\)/g, "redirect('/donatello')")
                     .replace(/logo: '\/logo pizzaria impperial\.jpeg'/g, "logo: '/DONATELLO PIZZA LOGO.png'")
                     .replace(/src=\"\/logo pizzaria impperial\.jpeg\"/g, 'src="/DONATELLO PIZZA LOGO.png"')
                     .replace(/logo pizzaria impperial\.jpeg/g, 'DONATELLO PIZZA LOGO.png')
                     .replace(/IMPPERIAL10/g, 'DONATELLO10')
                     .replace(/Combo Impperial/g, 'Combo Donatello')
                     .replace(/Dourado Impperial/g, 'Roxo Donatello')
                     .replace(/Impperial/g, 'Donatello')
                     .replace(/impperial/g, 'donatello');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated: ' + file);
    }
  }
});
