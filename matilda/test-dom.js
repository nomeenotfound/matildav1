import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf-8');
console.log(html);
