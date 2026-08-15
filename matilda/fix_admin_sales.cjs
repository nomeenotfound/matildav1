const fs = require('fs');
let content = fs.readFileSync('src/components/admin/pages/AdminSales.tsx', 'utf8');

// Add states
content = content.replace(
  "const [saleDiscountPercent, setSaleDiscountPercent] = useState(0);",
  "const [saleDiscountPercent, setSaleDiscountPercent] = useState(0);\n  const [saleType, setSaleType] = useState('percentage');\n  const [saleDiscountAmount, setSaleDiscountAmount] = useState(0);"
);

// Fetch settings
content = content.replace(
  "if (data.sale_discount_percent) setSaleDiscountPercent(Number(data.sale_discount_percent));",
  "if (data.sale_discount_percent) setSaleDiscountPercent(Number(data.sale_discount_percent));\n        if (data.sale_type) setSaleType(data.sale_type);\n        if (data.sale_discount_amount) setSaleDiscountAmount(Number(data.sale_discount_amount));"
);

// Save settings
content = content.replace(
  "await fetch('/api/admin/settings', { method: 'PUT', headers, body: JSON.stringify({ key: 'sale_discount_percent', value: saleDiscountPercent.toString() }) });",
  "await fetch('/api/admin/settings', { method: 'PUT', headers, body: JSON.stringify({ key: 'sale_discount_percent', value: saleDiscountPercent.toString() }) });\n    await fetch('/api/admin/settings', { method: 'PUT', headers, body: JSON.stringify({ key: 'sale_type', value: saleType }) });\n    await fetch('/api/admin/settings', { method: 'PUT', headers, body: JSON.stringify({ key: 'sale_discount_amount', value: saleDiscountAmount.toString() }) });"
);

// Add UI fields
const oldUI = `          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Global Discount Percentage (%)</label>
            <input 
              type="number" 
              value={saleDiscountPercent} 
              onChange={e => setSaleDiscountPercent(Number(e.target.value))} 
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[var(--border-admin)] outline-none"
              placeholder="e.g. 20"
              min="0" max="100"
            />
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Applies automatically to all products at checkout.</p>
          </div>`;

const newUI = `          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Sale Type</label>
            <select 
              value={saleType} 
              onChange={e => setSaleType(e.target.value)} 
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[var(--border-admin)] outline-none"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          
          {saleType === 'percentage' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Global Discount Percentage (%)</label>
              <input 
                type="number" 
                value={saleDiscountPercent} 
                onChange={e => setSaleDiscountPercent(Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[var(--border-admin)] outline-none"
                placeholder="e.g. 20"
                min="0" max="100"
              />
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Applies automatically to all products at checkout.</p>
            </div>
          )}

          {saleType === 'fixed' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Global Discount Amount (₹)</label>
              <input 
                type="number" 
                value={saleDiscountAmount} 
                onChange={e => setSaleDiscountAmount(Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[var(--border-admin)] outline-none"
                placeholder="e.g. 500"
                min="0"
              />
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Fixed amount applied automatically at checkout.</p>
            </div>
          )}`;

content = content.replace(oldUI, newUI);
fs.writeFileSync('src/components/admin/pages/AdminSales.tsx', content);

