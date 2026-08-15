const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  'slug, title, collection, category, price: Number(price), description,',
  'slug, title, collection, category, price: Number(price), stock_count: Number(stock_count || 0), description,'
);
fs.writeFileSync('server.ts', content);
