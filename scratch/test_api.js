const http = require('http');

http.get('http://localhost:3000/api/pedidos/rastrear?q=%23B09F1D&empresaSlug=hamburgueria-gangao', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
}).on('error', console.error);
