const fs = require('fs');
let content = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

// Add states
content = content.replace(
  "const [saleDiscountPercent, setSaleDiscountPercent] = useState(0);",
  "const [saleDiscountPercent, setSaleDiscountPercent] = useState(0);\n  const [saleType, setSaleType] = useState('percentage');\n  const [saleDiscountAmount, setSaleDiscountAmount] = useState(0);"
);

// Fetch settings
content = content.replace(
  "setSaleDiscountPercent(Number(d.sale_discount_percent) || 0);",
  "setSaleDiscountPercent(Number(d.sale_discount_percent) || 0);\n        if (d.sale_type) setSaleType(d.sale_type);\n        if (d.sale_discount_amount) setSaleDiscountAmount(Number(d.sale_discount_amount) || 0);"
);

// Update logic
const oldLogic = `  if (saleActive && saleDiscountPercent > 0) {
    discountAmount = total * (saleDiscountPercent / 100);
    activeDiscountLabel = \`GLOBAL SALE (\${saleDiscountPercent}% OFF)\`;
  } else if (appliedPromo) {`;

const newLogic = `  if (saleActive) {
    if ((!saleType || saleType === 'percentage') && saleDiscountPercent > 0) {
      discountAmount = total * (saleDiscountPercent / 100);
      activeDiscountLabel = \`GLOBAL SALE (\${saleDiscountPercent}% OFF)\`;
    } else if (saleType === 'fixed' && saleDiscountAmount > 0) {
      discountAmount = Math.min(total, saleDiscountAmount);
      activeDiscountLabel = \`GLOBAL SALE (₹\${saleDiscountAmount} OFF)\`;
    }
  } else if (appliedPromo) {`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/CheckoutPage.tsx', content);

