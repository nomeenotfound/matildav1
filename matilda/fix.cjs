const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/async function mountVite\(\) \{/, 'async function mountVite() {\n  if (process.env.VERCEL) return;');
fs.writeFileSync('server.ts', code);
