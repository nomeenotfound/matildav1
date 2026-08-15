const fs = require('fs');
let content = fs.readFileSync('src/components/admin/pages/AdminDiscounts.tsx', 'utf8');

// Add target_type and target_products to formData
content = content.replace(
  "bogo_get: 1,",
  "bogo_get: 1, target_type: 'global', target_products: '',"
);
content = content.replace(
  "bogo_get: p.bogo_get || 1,",
  "bogo_get: p.bogo_get || 1, target_type: p.target_type || 'global', target_products: p.target_products ? p.target_products.join(', ') : '',"
);

// We need to parse target_products into array on save
content = content.replace(
  "const newPromo = { ...formData };",
  "const newPromo = { ...formData, target_products: formData.target_products.split(',').map(s => s.trim()).filter(Boolean) };"
);

// We need to add the target_type select and target_products input to the form
const formHtml = `
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Target</label>
                <select value={formData.target_type} onChange={e => setFormData({...formData, target_type: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]">
                  <option value="global">Global (All Products)</option>
                  <option value="specific">Specific Products</option>
                </select>
              </div>
              {formData.target_type === 'specific' && (
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Target Product IDs (comma separated)</label>
                  <input type="text" value={formData.target_products} onChange={e => setFormData({...formData, target_products: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" placeholder="e.g. matilda-01, matilda-02" />
                </div>
              )}
`;

content = content.replace(
  "              <div className=\"flex items-center gap-2 pt-2\">",
  formHtml + "\n              <div className=\"flex items-center gap-2 pt-2\">"
);

fs.writeFileSync('src/components/admin/pages/AdminDiscounts.tsx', content);
