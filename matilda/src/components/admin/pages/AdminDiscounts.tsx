import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

export const AdminDiscounts: React.FC = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoIndex, setEditingPromoIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ code: '', discount_percentage: 0, is_active: true });
  const [loading, setLoading] = useState(true);

  const fetchPromos = () => {
    setLoading(true);
    fetch('/api/store/settings')
      .then(r => r.json())
      .then(data => {
        if (data.promos) {
          try {
            setPromos(JSON.parse(data.promos));
          } catch (e) {
            setPromos([]);
          }
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleOpenModal = (index: number | null = null) => {
    if (index !== null) {
      setEditingPromoIndex(index);
      setFormData(promos[index]);
    } else {
      setEditingPromoIndex(null);
      setFormData({ code: '', discount_percentage: 0, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedPromos = [...promos];
    if (editingPromoIndex !== null) {
      updatedPromos[editingPromoIndex] = formData;
    } else {
      updatedPromos.push(formData);
    }
    
    const token = localStorage.getItem('admin_token');
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ key: 'promos', value: JSON.stringify(updatedPromos) })
    });
    
    setIsModalOpen(false);
    fetchPromos();
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    const updatedPromos = promos.filter((_, i) => i !== index);
    
    const token = localStorage.getItem('admin_token');
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ key: 'promos', value: JSON.stringify(updatedPromos) })
    });
    
    fetchPromos();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">promo codes.</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[var(--border-admin)] text-white font-micro uppercase tracking-widest text-[10px] px-6 py-3 rounded-full shadow-md hover:opacity-90 transition-all"
        >
          + new promo
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-[var(--border-admin-subtle)] border-b border-[var(--border-admin)] font-micro uppercase tracking-widest text-[10px] text-[var(--border-admin)]">
            <tr>
              <th className="p-6 font-normal">Promo Code</th>
              <th className="p-6 font-normal">Discount (%)</th>
              <th className="p-6 font-normal">Status</th>
              <th className="p-6 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && promos.map((p, index) => (
              <tr key={index} className="border-b border-[var(--border-admin-subtle)] last:border-0 hover:bg-white/50 transition-colors">
                <td className="p-6 font-bold uppercase">{p.code}</td>
                <td className="p-6">{p.discount_percentage}%</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full font-micro uppercase tracking-widest text-[10px] border ${
                    p.is_active ? 'border-green-500 text-green-500 bg-green-50' : 'border-gray-500 text-gray-500 bg-gray-50'
                  }`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-6 text-right flex justify-end gap-3">
                  <button onClick={() => handleOpenModal(index)} className="text-gray-500 hover:text-[var(--border-admin)]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(index)} className="text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {!loading && promos.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No promos found.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[var(--border-admin)] shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-xl font-bold lowercase tracking-tighter mb-6">
              {editingPromoIndex !== null ? 'edit promo' : 'new promo'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 font-micro text-xs">
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Promo Code</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)] uppercase" placeholder="e.g. SUMMER20" />
              </div>
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Discount Percentage (%)</label>
                <input required type="number" min="1" max="100" value={formData.discount_percentage} onChange={e => setFormData({...formData, discount_percentage: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="accent-[var(--border-admin)]" />
                <label htmlFor="isActive" className="uppercase tracking-widest text-[10px]">Active Status</label>
              </div>
              <button type="submit" className="w-full bg-[var(--border-admin)] text-white uppercase tracking-widest text-[10px] p-4 rounded-full mt-4 hover:opacity-90">
                Save Promo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
