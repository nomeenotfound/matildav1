const fs = require('fs');

let adminProducts = fs.readFileSync('src/components/admin/pages/AdminProducts.tsx', 'utf8');
adminProducts = adminProducts.replace(
  'h3 className="font-body text-sm font-bold line-clamp-1 mb-1 pr-8"',
  'h3 className="font-body text-sm font-bold mb-1 break-words"'
);
fs.writeFileSync('src/components/admin/pages/AdminProducts.tsx', adminProducts);

let searchModal = fs.readFileSync('src/components/SearchModal.tsx', 'utf8');
searchModal = searchModal.replace(
  'p className="text-xs text-[var(--text-muted)] line-clamp-1 lowercase"',
  'p className="text-xs text-[var(--text-muted)] break-words lowercase"'
);
searchModal = searchModal.replace(
  'h3 className="font-display font-bold text-[var(--text-dominant)] text-sm lowercase truncate"',
  'h3 className="font-display font-bold text-[var(--text-dominant)] text-sm lowercase break-words"'
);
fs.writeFileSync('src/components/SearchModal.tsx', searchModal);

