const fs = require('fs');
let content = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

const replacement = `
    let eligibleTotal = total;
    let eligibleItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (appliedPromo.target_type === 'specific' && Array.isArray(appliedPromo.target_products)) {
      eligibleTotal = cart
        .filter(item => appliedPromo.target_products.includes(item.product.id))
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      eligibleItemsCount = cart
        .filter(item => appliedPromo.target_products.includes(item.product.id))
        .reduce((sum, item) => sum + item.quantity, 0);
    }

    if (!appliedPromo.discount_type || appliedPromo.discount_type === 'percentage') {
      discountAmount = eligibleTotal * (appliedPromo.discount_percentage / 100);
      activeDiscountLabel = \`\${appliedPromo.code} (\${appliedPromo.discount_percentage}% OFF)\`;
    } else if (appliedPromo.discount_type === 'fixed') {
      discountAmount = Math.min(eligibleTotal, appliedPromo.discount_amount);
      activeDiscountLabel = \`\${appliedPromo.code} (₹\${appliedPromo.discount_amount} OFF)\`;
    } else if (appliedPromo.discount_type === 'bogo') {
      const buyQty = appliedPromo.bogo_buy || 1;
      const getQty = appliedPromo.bogo_get || 1;
      let freeItems = Math.floor(eligibleItemsCount / (buyQty + getQty)) * getQty;
      
      let eligibleItems = cart.filter(item => 
        appliedPromo.target_type === 'specific' ? appliedPromo.target_products.includes(item.product.id) : true
      ).flatMap(item => Array(item.quantity).fill(item.product.price)).sort((a, b) => a - b);

      let bogoDiscount = 0;
      for (let i = 0; i < freeItems && i < eligibleItems.length; i++) {
        bogoDiscount += eligibleItems[i];
      }
      discountAmount = bogoDiscount;
      activeDiscountLabel = \`\${appliedPromo.code} (BOGO APPLIED)\`;
    }
`;

content = content.replace(
  /    if \(\!appliedPromo\.discount_type \|\| appliedPromo\.discount_type === 'percentage'\) {[\s\S]*?activeDiscountLabel = `\$\{appliedPromo\.code\} \(BOGO APPLIED\)`;\n    }/m,
  replacement
);

fs.writeFileSync('src/components/CheckoutPage.tsx', content);
