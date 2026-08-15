const fs = require('fs');
let content = fs.readFileSync('src/components/ProductModal.tsx', 'utf8');

// Fix image click handler for zoom
content = content.replace(
  'className="w-full h-full aspect-square object-cover"',
  'className="w-full h-full aspect-square object-cover cursor-zoom-in" onClick={() => setIsZoomed(true)}'
);

// Fix title text scaling
content = content.replace(
  'h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-dominant)] mt-0.5 lowercase"',
  'h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[var(--text-dominant)] mt-0.5 lowercase break-words max-w-full"'
);

fs.writeFileSync('src/components/ProductModal.tsx', content);
