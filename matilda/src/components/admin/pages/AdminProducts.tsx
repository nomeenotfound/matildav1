import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus, Loader2 } from 'lucide-react';
import { useAdminProducts } from '../../../hooks/useAdminProducts';

export const AdminProducts: React.FC = () => {
  const { products, loading, error, fetchProducts, saveProduct, deleteProduct } = useAdminProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', collection: 'women', category: '', price: 0, description: '', material: '',
    mainImage: '', lifestyleImage: '', imageFit: 'cover',
    isFeatured: false, hasVictorianFrame: false,
    details: [''],
    galleryImages: [''],
    variants: [{ id: 'v1', name: '', inStock: true }]
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        collection: product.collection || 'women',
        category: product.category || '',
        price: product.price || 0,
        description: product.description || '',
        material: product.material || '',
        mainImage: product.mainImage || '',
        lifestyleImage: product.lifestyleImage || '',
        imageFit: product.imageFit || 'cover',
        isFeatured: !!product.isFeatured,
        hasVictorianFrame: !!product.hasVictorianFrame,
        details: Array.isArray(product.details) && product.details.length > 0 ? product.details : [''],
        galleryImages: Array.isArray(product.galleryImages) && product.galleryImages.length > 0 ? product.galleryImages : [''],
        variants: Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [{ id: 'v1', name: '', inStock: true }]
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '', slug: '', collection: 'women', category: '', price: 0, description: '', material: '',
        mainImage: '', lifestyleImage: '', imageFit: 'cover',
        isFeatured: false, hasVictorianFrame: false,
        details: [''], galleryImages: [''],
        variants: [{ id: 'v1', name: '', inStock: true }]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProduct(formData, editingProduct?.id);
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleArrayChange = (index: number, value: string, field: 'details' | 'galleryImages') => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData({ ...formData, [field]: newArr });
  };
  const addArrayItem = (field: 'details' | 'galleryImages') => setFormData({ ...formData, [field]: [...formData[field], ''] });

  const handleVariantChange = (index: number, key: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [key]: value };
    setFormData({ ...formData, variants: newVariants });
  };
  const addVariant = () => setFormData({ ...formData, variants: [...formData.variants, { id: `v${Date.now()}`, name: '', inStock: true }] });

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
              <th className="p-6 font-normal">Collection</th>
              <th className="p-6 font-normal">Price</th>
              <th className="p-6 font-normal">Variants</th>
              <th className="p-6 font-normal">Status</th>
              <th className="p-6 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-[var(--border-admin-subtle)] last:border-0 hover:bg-white/50 transition-colors">
                <td className="p-6 font-body text-sm font-bold flex items-center gap-3">
                  {p.mainImage && <img src={p.mainImage} alt={p.title} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />}
                  {p.title}
                </td>
                <td className="p-6">{p.collection} / {p.category}</td>
                <td className="p-6">₹{p.price}</td>
                <td className="p-6">{Array.isArray(p.variants) ? p.variants.length : 0} options</td>
                <td className="p-6">
                  {p.isFeatured && <span className="px-3 py-1 border border-yellow-500 text-yellow-600 bg-yellow-50 rounded-full">Featured</span>}
                </td>
                <td className="p-6 text-right flex justify-end gap-3 h-full items-center mt-2">
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
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-admin)] shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-xl font-bold lowercase tracking-tighter mb-6">{editingProduct ? 'edit product' : 'new product'}</h3>
            
            <form onSubmit={handleSave} className="space-y-8 font-micro text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Slug (optional)</label>
                  <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="auto-generated if empty" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Collection</label>
                  <select value={formData.collection} onChange={e => setFormData({...formData, collection: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]">
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. jewelry" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Material</label>
                  <input required type="text" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]"></textarea>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <h4 className="uppercase tracking-widest text-[10px] text-gray-500 font-bold">Media</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Main Image URL</label>
                    <input required type="url" value={formData.mainImage} onChange={e => setFormData({...formData, mainImage: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                  </div>
                  <div>
                    <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Lifestyle Image URL</label>
                    <input required type="url" value={formData.lifestyleImage} onChange={e => setFormData({...formData, lifestyleImage: e.target.value})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-2">Gallery Images</label>
                  {formData.galleryImages.map((img, i) => (
                    <input key={i} type="url" value={img} onChange={e => handleArrayChange(i, e.target.value, 'galleryImages')} placeholder="Image URL" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)] mb-2" />
                  ))}
                  <button type="button" onClick={() => addArrayItem('galleryImages')} className="text-gray-500 hover:text-black flex items-center gap-1 mt-1"><Plus className="w-3 h-3"/> Add Image</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                <div>
                  <h4 className="uppercase tracking-widest text-[10px] text-gray-500 font-bold mb-3">Bullet Details</h4>
                  {formData.details.map((det, i) => (
                    <input key={i} type="text" value={det} onChange={e => handleArrayChange(i, e.target.value, 'details')} placeholder="Detail point" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)] mb-2" />
                  ))}
                  <button type="button" onClick={() => addArrayItem('details')} className="text-gray-500 hover:text-black flex items-center gap-1 mt-1"><Plus className="w-3 h-3"/> Add Detail</button>
                </div>
                
                <div>
                  <h4 className="uppercase tracking-widest text-[10px] text-gray-500 font-bold mb-3">Variants</h4>
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input type="text" value={v.name} onChange={e => handleVariantChange(i, 'name', e.target.value)} placeholder="Variant Name (e.g. 18 inch)" className="flex-1 border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                      <label className="flex items-center gap-1 whitespace-nowrap">
                        <input type="checkbox" checked={v.inStock} onChange={e => handleVariantChange(i, 'inStock', e.target.checked)} className="accent-[var(--border-admin)]" />
                        In Stock
                      </label>
                    </div>
                  ))}
                  <button type="button" onClick={addVariant} className="text-gray-500 hover:text-black flex items-center gap-1 mt-1"><Plus className="w-3 h-3"/> Add Variant</button>
                </div>
              </div>

              <div className="flex items-center gap-6 border-t border-gray-100 pt-6">
                <label className="flex items-center gap-2 uppercase tracking-widest text-[10px] cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="accent-[var(--border-admin)] w-4 h-4" />
                  Featured Product
                </label>
                <label className="flex items-center gap-2 uppercase tracking-widest text-[10px] cursor-pointer">
                  <input type="checkbox" checked={formData.hasVictorianFrame} onChange={e => setFormData({...formData, hasVictorianFrame: e.target.checked})} className="accent-[var(--border-admin)] w-4 h-4" />
                  Victorian Frame Border
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button type="submit" className="w-full bg-[var(--border-admin)] text-white uppercase tracking-widest text-[10px] p-4 rounded-full hover:opacity-90 transition-opacity">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
