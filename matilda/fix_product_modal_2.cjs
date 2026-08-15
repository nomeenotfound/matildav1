const fs = require('fs');
let content = fs.readFileSync('src/components/ProductModal.tsx', 'utf8');

content = content.replace(
  '<div className="flex justify-between items-start text-xs pr-8">',
  '<div className="flex justify-between items-start text-xs gap-4">'
);
content = content.replace(
  '<div>\n                  <span className="text-[var(--border-maroon)]',
  '<div className="flex-1">\n                  <span className="text-[var(--border-maroon)]'
);

fs.writeFileSync('src/components/ProductModal.tsx', content);
