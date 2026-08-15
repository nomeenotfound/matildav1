const fs = require('fs');
let content = fs.readFileSync('src/components/ProductModal.tsx', 'utf8');

const zoomOverlayRegex = /\{\/\* Zoom Overlay \*\/\}\s*<AnimatePresence>\s*\{isZoomed && \([\s\S]*?<\/AnimatePresence>/m;
const match = content.match(zoomOverlayRegex);

if (match) {
  const zoomCode = match[0];
  content = content.replace(zoomOverlayRegex, '');
  
  // Insert it just before the closing tag of the main wrapper
  content = content.replace(
    /        <\/motion\.div>\n      <\/div>\n    <\/AnimatePresence>/m,
    `        </motion.div>\n        ${zoomCode}\n      </div>\n    </AnimatePresence>`
  );
  
  fs.writeFileSync('src/components/ProductModal.tsx', content);
  console.log("Zoom overlay moved.");
} else {
  console.log("Zoom overlay not found.");
}
