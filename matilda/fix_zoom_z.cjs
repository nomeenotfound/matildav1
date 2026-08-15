const fs = require('fs');
let content = fs.readFileSync('src/components/ProductModal.tsx', 'utf8');

content = content.replace(
  'className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"',
  'className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"'
);

fs.writeFileSync('src/components/ProductModal.tsx', content);
