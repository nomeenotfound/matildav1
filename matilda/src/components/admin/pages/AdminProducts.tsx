import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', category: '', price: 0, stock_count: 0, is_active: true });

  const fetchProducts = () => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/products', {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock_count: product.stock_count,
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: 0, stock_count: 0, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(formData)
    });
    
    setIsModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">product cms.</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[var(--border-admin)] text-white font-micro uppercase tracking-widest text-[10px] px-6 py-3 rounded-full shadow-md hover:opacity-90 transition-all"
        >
          + new product
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-[var(--border-admin)] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left font-micro text-xs">
          <thead className="bg-white/50 border-b border-[var(--border-admin-subtle)] uppercase tracking-widest text-[10px] text-gray-500">
            <tr>
              <th className="p-6 font-normal">Product</th>
              <th className="p-6 font-normal">Category</th>
              <th className="p-6 font-normal">Price</th>
              <th className="p-6 font-normal">Stock</th>
              <th className="p-6 font-normal">Status</th>
              <th className="p-6 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-[var(--border-admin-subtle)] last:border-0 hover:bg-white/50 transition-colors">
                <td className="p-6 font-body text-sm font-bold">{p.name}</td>
                <td className="p-6">{p.category}</td>
                <td className="p-6">₹{p.price}</td>
                <td className="p-6">{p.stock_count}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 border rounded-full ${p.is_active ? 'border-green-500 text-green-500 bg-green-50' : 'border-gray-500 text-gray-500 bg-gray-50'}`}>
                    {p.is_active ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="p-6 text-right flex justify-end gap-3">
                  <button onClick={() => handleOpenModal(p)} className="text-gray-500 hover:text-[var(--border-admin)]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No products found.</td></tr>
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
            <h3 className="font-display text-xl font-bold lowercase tracking-tighter mb-6">{editingProduct ? 'edit product' : 'new product'}</h3>
            <form onSubmit={handleSave} className="space-y-4 font-micro text-xs">
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
              </div>
              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Stock</label>
                  <input required type="number" value={formData.stock_count} onChange={e => setFormData({...formData, stock_count: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="accent-[var(--border-admin)]" />
                <label htmlFor="isActive" className="uppercase tracking-widest text-[10px]">Active Status</label>
              </div>
              <button type="submit" className="w-full bg-[var(--border-admin)] text-white uppercase tracking-widest text-[10px] p-4 rounded-full mt-4 hover:opacity-90">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
