import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const AdminSales: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saleActive, setSaleActive] = useState(false);
  const [saleText, setSaleText] = useState('END OF SEASON SALE: UP TO 50% OFF');
  const [saleDiscountPercent, setSaleDiscountPercent] = useState(0);
  const [saleType, setSaleType] = useState('percentage');
  const [saleDiscountAmount, setSaleDiscountAmount] = useState(0);

  useEffect(() => {
    const loadStoreSettings = async () => {
      let settingsObj: Record<string, any> = {};

      if (supabase) {
        try {
          const { data } = await supabase.from('store_settings').select('*');
          if (data && Array.isArray(data)) {
            data.forEach((item: any) => {
              settingsObj[item.key] = item.value;
            });
          }
        } catch (e) {
          console.warn("Supabase load sale settings notice:", e);
        }
      }

      if (Object.keys(settingsObj).length === 0) {
        try {
          const local = localStorage.getItem('matilda_store_settings');
          if (local) settingsObj = JSON.parse(local);
        } catch (e) {}
      }

      if (settingsObj.sale_active !== undefined) setSaleActive(settingsObj.sale_active === 'true' || settingsObj.sale_active === true);
      if (settingsObj.sale_text) setSaleText(settingsObj.sale_text);
      if (settingsObj.sale_discount_percent) setSaleDiscountPercent(Number(settingsObj.sale_discount_percent));
      if (settingsObj.sale_type) setSaleType(settingsObj.sale_type);
      if (settingsObj.sale_discount_amount) setSaleDiscountAmount(Number(settingsObj.sale_discount_amount));

      setLoading(false);
    };

    loadStoreSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const settings = {
      sale_active: saleActive.toString(),
      sale_text: saleText,
      sale_discount_percent: saleDiscountPercent.toString(),
      sale_type: saleType,
      sale_discount_amount: saleDiscountAmount.toString()
    };

    if (supabase) {
      try {
        const rows = Object.entries(settings).map(([key, value]) => ({
          key,
          value,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('store_settings').upsert(rows);
      } catch (e) {
        console.warn("Supabase upsert settings notice:", e);
      }
    }

    try {
      localStorage.setItem('matilda_store_settings', JSON.stringify(settings));
    } catch (e) {}

    setSaving(false);
    alert('Sale settings updated successfully.');
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[var(--border-admin)] w-8 h-8" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">store sales.</h2>
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--border-admin-subtle)] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div>
            <h3 className="font-bold text-sm">Site-Wide Sale Active</h3>
            <p className="text-xs text-gray-500 mt-1">Enable to show banner and apply global discount.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={saleActive} onChange={e => setSaleActive(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--border-admin)]"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Banner Text</label>
            <input 
              type="text" 
              value={saleText} 
              onChange={e => setSaleText(e.target.value)} 
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[var(--border-admin)] outline-none"
              placeholder="e.g. END OF SEASON SALE: 20% OFF"
            />
          </div>
          
          <div>
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
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[var(--border-admin)] text-white text-xs uppercase tracking-widest font-bold py-4 rounded-full hover:opacity-90 transition-opacity flex justify-center items-center"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Sale Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
