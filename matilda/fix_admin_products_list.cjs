const fs = require('fs');
let content = fs.readFileSync('src/components/admin/pages/AdminProducts.tsx', 'utf8');
content = content.replace(
  '<span className="font-micro text-[9px] uppercase tracking-widest text-gray-400">{Array.isArray(p.variants) ? p.variants.length : 0} options</span>',
  '<span className="font-micro text-[9px] uppercase tracking-widest text-gray-400">{Array.isArray(p.variants) ? p.variants.length : 0} options &middot; Stock: {p.stock_count || 0}</span>'
);
fs.writeFileSync('src/components/admin/pages/AdminProducts.tsx', content);
