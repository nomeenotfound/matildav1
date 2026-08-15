const fs = require('fs');

let cartDrawer = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
cartDrawer = cartDrawer.replace(
  'h4 className="font-display text-xs font-bold lowercase truncate text-[var(--text-dominant)]"',
  'h4 className="font-display text-xs font-bold lowercase break-words text-[var(--text-dominant)]"'
);
fs.writeFileSync('src/components/CartDrawer.tsx', cartDrawer);

