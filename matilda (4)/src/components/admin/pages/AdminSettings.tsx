import React, { useEffect, useState } from 'react';

export const AdminSettings: React.FC = () => {
  const [upi, setUpi] = useState({ upi_id: '', payee_name: '', qr_note: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/store/settings').then(r => r.json()).then(d => {
      if (d.upi_config) {
        setUpi({
          upi_id: d.upi_config.upi_id || '',
          payee_name: d.upi_config.payee_name || '',
          qr_note: d.upi_config.qr_note || ''
        });
      }
    });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ key: 'upi_config', value: upi })
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">store settings.</h2>
      
      <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl p-8 space-y-6 shadow-sm">
        <h3 className="font-micro uppercase tracking-widest text-xs mb-4 border-b border-[var(--border-admin-subtle)] pb-4">UPI Configuration</h3>
        
        <div>
          <label className="block font-micro uppercase tracking-widest text-[10px] mb-2 pl-2">UPI ID</label>
          <input 
            type="text" 
            value={upi.upi_id} 
            onChange={e => setUpi({...upi, upi_id: e.target.value})} 
            className="w-full border border-[var(--border-admin)] rounded-2xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-admin)]" 
          />
        </div>
        
        <div>
          <label className="block font-micro uppercase tracking-widest text-[10px] mb-2 pl-2">Payee Name</label>
          <input 
            type="text" 
            value={upi.payee_name} 
            onChange={e => setUpi({...upi, payee_name: e.target.value})} 
            className="w-full border border-[var(--border-admin)] rounded-2xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-admin)]" 
          />
        </div>

        <div>
          <label className="block font-micro uppercase tracking-widest text-[10px] mb-2 pl-2">Payment Note</label>
          <input 
            type="text" 
            value={upi.qr_note} 
            onChange={e => setUpi({...upi, qr_note: e.target.value})} 
            className="w-full border border-[var(--border-admin)] rounded-2xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-[var(--border-admin)]" 
          />
        </div>

        <button 
          onClick={saveSettings} 
          disabled={saving}
          className="mt-6 bg-[var(--border-admin)] text-white font-micro uppercase tracking-widest text-[10px] px-6 py-4 rounded-full shadow-md hover:opacity-90 w-full transition-all disabled:opacity-50"
        >
          {saving ? 'saving...' : 'save upi settings'}
        </button>
      </div>
    </div>
  );
};
