const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  'const { \n    id, slug, title, collection, category, price, description, details,\n    mainImage, lifestyleImage, galleryImages, imageFit, variants,\n    isFeatured, hasVictorianFrame, material \n  } = req.body;',
  'const { \n    id, slug, title, collection, category, price, stock_count, description, details,\n    mainImage, lifestyleImage, galleryImages, imageFit, variants,\n    isFeatured, hasVictorianFrame, material \n  } = req.body;'
);
content = content.replace(
  'title, collection, category, price: Number(price), description,',
  'title, collection, category, price: Number(price), stock_count: Number(stock_count || 0), description,'
);
content = content.replace(
  'const { \n    slug, title, collection, category, price, description, details,\n    mainImage, lifestyleImage, galleryImages, imageFit, variants,\n    isFeatured, hasVictorianFrame, material \n  } = req.body;',
  'const { \n    slug, title, collection, category, price, stock_count, description, details,\n    mainImage, lifestyleImage, galleryImages, imageFit, variants,\n    isFeatured, hasVictorianFrame, material \n  } = req.body;'
);
fs.writeFileSync('server.ts', content);
