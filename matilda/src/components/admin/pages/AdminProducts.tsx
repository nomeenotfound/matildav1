import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus, Loader2, Search } from 'lucide-react';
import { useAdminProducts } from '../../../hooks/useAdminProducts';
import { useCollection } from '../../../context/CollectionContext';
import { supabase } from '../../../lib/supabase';

export const AdminProducts: React.FC = () => {
  const { products, loading, error, fetchProducts, saveProduct, deleteProduct } = useAdminProducts();
  const { categories } = useCollection();
  const [isUploading, setIsUploading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', collection: 'women', category: '', price: 0, stock_count: 0, description: '', material: '',
    mainImage: '', lifestyleImage: '', imageFit: 'cover',
    isFeatured: false, hasVictorianFrame: false,
    details: [''],
    galleryImages: [''],
    variants: [{ id: 'v1', name: '', inStock: true, stock: 10 }]
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      const normalizedVars = Array.isArray(product.variants) && product.variants.length > 0
        ? product.variants.map((v: any, idx: number) => ({
            id: v.id || `v_${idx + 1}`,
            name: v.name || '',
            stock: typeof v.stock === 'number' ? v.stock : (v.inStock ? 10 : 0),
            inStock: typeof v.inStock === 'boolean' ? v.inStock : (v.stock > 0)
          }))
        : [{ id: 'v1', name: '', inStock: true, stock: 10 }];

      const totalStock = normalizedVars.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        collection: product.collection || 'women',
        category: product.category || '',
        price: product.price || 0,
        stock_count: product.stock_count !== undefined ? product.stock_count : totalStock,
        description: product.description || '',
        material: product.material || '',
        mainImage: product.mainImage || '',
        lifestyleImage: product.lifestyleImage || '',
        imageFit: product.imageFit || 'cover',
        isFeatured: !!product.isFeatured,
        hasVictorianFrame: !!product.hasVictorianFrame,
        details: Array.isArray(product.details) && product.details.length > 0 ? product.details : [''],
        galleryImages: Array.isArray(product.galleryImages) && product.galleryImages.length > 0 ? product.galleryImages : [''],
        variants: normalizedVars
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '', slug: '', collection: 'women', category: '', price: 0, stock_count: 10, description: '', material: '',
        mainImage: '', lifestyleImage: '', imageFit: 'cover',
        isFeatured: false, hasVictorianFrame: false,
        details: [''], galleryImages: [''],
        variants: [{ id: 'v1', name: '', inStock: true, stock: 10 }]
      });
    }
    setIsModalOpen(true);
  };

  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProduct(formData, editingProduct?.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const confirmAndExecuteDelete = async () => {
    if (!deletingProduct) return;
    const targetId = deletingProduct.id;
    setDeletingProduct(null);
    try {
      await deleteProduct(targetId);
    } catch (err) {
      console.error('Failed to delete product:', err);
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

    // Auto calculate total product stock from variants
    const newTotalStock = newVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
    setFormData({ ...formData, variants: newVariants, stock_count: newTotalStock });
  };
  const addVariant = () => {
    const newVars = [...formData.variants, { id: `v${Date.now()}`, name: '', inStock: true, stock: 10 }];
    const newTotalStock = newVars.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
    setFormData({ ...formData, variants: newVars, stock_count: newTotalStock });
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'mainImage' | 'lifestyleImage' | 'galleryImages', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      let uploadedUrl = '';

      if (supabase) {
        try {
          const fileExt = file.name.split('.').pop() || 'png';
          const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
            uploadedUrl = publicUrlData.publicUrl;
          }
        } catch (e) {
          console.warn("Supabase storage upload notice:", e);
        }
      }

      if (!uploadedUrl) {
        // Base64 fallback
        uploadedUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string || '');
          reader.readAsDataURL(file);
        });
      }

      if (field === 'galleryImages' && index !== undefined) {
        handleArrayChange(index, uploadedUrl, 'galleryImages');
      } else {
        setFormData({ ...formData, [field]: uploadedUrl });
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.collection && p.collection.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-display text-2xl font-bold lowercase tracking-tighter">product cms.</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-xs font-micro uppercase tracking-widest focus:outline-none focus:border-[var(--border-admin)]"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[var(--border-admin)] text-white font-micro uppercase tracking-widest text-[10px] px-6 py-2.5 rounded-full shadow-md hover:opacity-90 transition-all whitespace-nowrap"
          >
            + new
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white/70 backdrop-blur-md border border-[var(--border-admin-subtle)] rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[var(--border-admin)] transition-all relative group">
            <div className="absolute top-3 right-3 flex gap-2 opacity-100 z-10 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm">
              <button onClick={() => handleOpenModal(p)} className="p-1.5 text-gray-500 hover:text-[var(--border-admin)] hover:bg-gray-100 rounded-md transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeletingProduct(p)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
               {p.mainImage ? (
                 <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">No Image</div>
               )}
               {p.isFeatured && (
                 <span className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest rounded-md">Featured</span>
               )}
            </div>
            
            <div className="flex flex-col flex-1">
              <h3 className="font-body text-sm font-bold mb-1 break-words">{p.title}</h3>
              <p className="font-micro text-[10px] uppercase tracking-widest text-gray-500 mb-2">{p.collection} / {p.category}</p>
              
              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-display font-bold text-sm">₹{p.price}</span>
                <span className="font-micro text-[9px] uppercase tracking-widest text-gray-400">{Array.isArray(p.variants) ? p.variants.length : 0} options &middot; Stock: {p.stock_count || 0}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white/50 border border-dashed border-gray-300 rounded-3xl">
            <p className="font-micro text-xs uppercase tracking-widest text-gray-500">No products found.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-admin)] shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-xl font-bold lowercase tracking-tighter mb-6">{editingProduct ? 'edit product' : 'new product'}</h3>
            
            <form onSubmit={handleSave} className="space-y-8 font-micro text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="flex gap-2">
                    <select
                      value={categories.some(c => c.slug === formData.category || c.name.toLowerCase() === formData.category.toLowerCase()) ? formData.category : (formData.category ? 'custom' : '')}
                      onChange={e => {
                        if (e.target.value && e.target.value !== 'custom') {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)] bg-white"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug || c.name.toLowerCase()}>{c.name}</option>
                      ))}
                      <option value="custom">Other / Custom</option>
                    </select>
                    <input
                      required
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. jewelry"
                      className="flex-1 border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Stock Count</label>
                  <input required type="number" value={formData.stock_count} onChange={e => setFormData({...formData, stock_count: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
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
                <h4 className="uppercase tracking-widest text-[10px] text-gray-500 font-bold">Media {isUploading && <span className="text-[var(--border-admin)] lowercase ml-2 font-normal animate-pulse">uploading...</span>}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Main Image URL</label>
                    <div className="flex gap-2">
                      <input required type="url" value={formData.mainImage} onChange={e => setFormData({...formData, mainImage: e.target.value})} className="flex-1 border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                      <label className="cursor-pointer flex items-center justify-center px-4 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-xs font-medium transition-colors">
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'mainImage')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-1">Lifestyle Image URL</label>
                    <div className="flex gap-2">
                      <input required type="url" value={formData.lifestyleImage} onChange={e => setFormData({...formData, lifestyleImage: e.target.value})} className="flex-1 border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                      <label className="cursor-pointer flex items-center justify-center px-4 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-xs font-medium transition-colors">
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'lifestyleImage')} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-[10px] text-gray-500 mb-2">Gallery Images</label>
                  {formData.galleryImages.map((img, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="url" value={img} onChange={e => handleArrayChange(i, e.target.value, 'galleryImages')} placeholder="Image URL" className="flex-1 border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)]" />
                      <label className="cursor-pointer flex items-center justify-center px-4 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-xs font-medium transition-colors">
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'galleryImages', i)} />
                      </label>
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('galleryImages')} className="text-gray-500 hover:text-black flex items-center gap-1 mt-1"><Plus className="w-3 h-3"/> Add Image</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                <div>
                  <h4 className="uppercase tracking-widest text-[10px] text-gray-500 font-bold mb-3">Bullet Details</h4>
                  {formData.details.map((det, i) => (
                    <input key={i} type="text" value={det} onChange={e => handleArrayChange(i, e.target.value, 'details')} placeholder="Detail point" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[var(--border-admin)] mb-2" />
                  ))}
                  <button type="button" onClick={() => addArrayItem('details')} className="text-gray-500 hover:text-black flex items-center gap-1 mt-1"><Plus className="w-3 h-3"/> Add Detail</button>
                </div>
                
                <div>
                  <h4 className="uppercase tracking-widest text-[10px] text-gray-500 font-bold mb-3">Variants &amp; Stock Amounts</h4>
                  <div className="space-y-2">
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-gray-50/80">
                        <input
                          type="text"
                          value={v.name}
                          onChange={e => handleVariantChange(i, 'name', e.target.value)}
                          placeholder="Colour / Variant Name (e.g. Black, 18 inch)"
                          className="flex-1 min-w-[140px] border border-gray-200 rounded-lg p-2 outline-none focus:border-[var(--border-admin)] bg-white text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase font-bold text-gray-500">Stock:</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stock !== undefined ? v.stock : (v.inStock ? 10 : 0)}
                            onChange={e => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              const newVars = [...formData.variants];
                              newVars[i] = { ...newVars[i], stock: val, inStock: val > 0 };
                              const newTotalStock = newVars.reduce((sum: number, item: any) => sum + (item.stock || 0), 0);
                              setFormData({ ...formData, variants: newVars, stock_count: newTotalStock });
                            }}
                            className="w-20 border border-gray-200 rounded-lg p-2 outline-none focus:border-[var(--border-admin)] bg-white text-xs text-center font-bold"
                          />
                        </div>
                        <label className="flex items-center gap-1 whitespace-nowrap text-[11px]">
                          <input
                            type="checkbox"
                            checked={v.stock > 0 || v.inStock}
                            onChange={e => {
                              const checked = e.target.checked;
                              const newVars = [...formData.variants];
                              const newStock = checked ? (v.stock > 0 ? v.stock : 10) : 0;
                              newVars[i] = { ...newVars[i], inStock: checked, stock: newStock };
                              const newTotalStock = newVars.reduce((sum: number, item: any) => sum + (item.stock || 0), 0);
                              setFormData({ ...formData, variants: newVars, stock_count: newTotalStock });
                            }}
                            className="accent-[var(--border-admin)]"
                          />
                          In Stock
                        </label>
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.variants.filter((_, idx) => idx !== i);
                              const newTotal = updated.reduce((sum: number, item: any) => sum + (item.stock || 0), 0);
                              setFormData({ ...formData, variants: updated, stock_count: newTotal });
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Remove variant"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addVariant} className="text-gray-500 hover:text-black flex items-center gap-1 mt-2 text-xs font-bold">
                    <Plus className="w-3.5 h-3.5"/> Add Colour / Variant
                  </button>
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
      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-red-100 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold lowercase tracking-tighter">
              delete "{deletingProduct.title}"?
            </h3>
            <p className="text-xs text-gray-500 font-micro">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-xs font-micro uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndExecuteDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-full text-xs font-micro uppercase tracking-widest hover:bg-red-700 shadow-md transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
