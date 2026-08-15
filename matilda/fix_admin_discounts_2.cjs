const fs = require('fs');
let content = fs.readFileSync('src/components/admin/pages/AdminDiscounts.tsx', 'utf8');

content = content.replace(
  "bogo_get: promos[index].bogo_get || 1,",
  "bogo_get: promos[index].bogo_get || 1, target_type: promos[index].target_type || 'global', target_products: (promos[index].target_products || []).join(', '),"
);

content = content.replace(
  "setFormData({ code: '', discount_type: 'percentage', discount_percentage: 0, discount_amount: 0, bogo_buy: 1, bogo_get: 1, is_active: true });",
  "setFormData({ code: '', discount_type: 'percentage', discount_percentage: 0, discount_amount: 0, bogo_buy: 1, bogo_get: 1, target_type: 'global', target_products: '', is_active: true });"
);

fs.writeFileSync('src/components/admin/pages/AdminDiscounts.tsx', content);
