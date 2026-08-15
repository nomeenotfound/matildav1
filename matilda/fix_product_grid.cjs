const fs = require('fs');
let content = fs.readFileSync('src/components/ProductGrid.tsx', 'utf8');

// Fix title text scaling and wrapping
content = content.replace(
  'h3 className="text-[var(--text-dominant)] font-display font-medium text-sm sm:text-base leading-snug line-clamp-2"',
  'h3 className="text-[var(--text-dominant)] font-display font-medium text-xs sm:text-sm md:text-base leading-snug break-words"'
);

fs.writeFileSync('src/components/ProductGrid.tsx', content);
