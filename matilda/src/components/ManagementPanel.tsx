import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection } from '../context/CollectionContext';
import { Product, ProductVariant } from '../types';
import { supabase } from '../lib/supabase';
import {
  X,
  Plus,
  Trash2,
  Edit,
  RotateCcw,
  Search,
  Check,
  Package,
  Sparkles,
  SlidersHorizontal,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  KeyRound,
  Upload,
  Tags,
  FolderPlus,
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'Silver Necklace',
    main: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
    lifestyle: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Gold Ring',
    main: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
    lifestyle: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Ceramic Craft',
    main: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    lifestyle: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Linen / Wear',
    main: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
    lifestyle: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
  },
];

export const ManagementPanel: React.FC = () => {
  const {
    isManagementOpen,
    setIsManagementOpen,
    products,
    addProduct,
    updateProduct,
    removeProduct,
    resetProductsToDefault,
    openProductModal,
    categories,
    addCategory,
    removeCategory,
    resetCategoriesToDefault,
  } = useCollection();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit' | 'categories'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollection, setFilterCollection] = useState<'all' | 'women' | 'men' | 'both'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Form State for Add / Edit
  const [formState, setFormState] = useState<{
    title: string;
    slug: string;
    collection: 'women' | 'men' | 'both';
    category: string;
    price: number;
    material: string;
    description: string;
    detailsText: string;
    mainImage: string;
    lifestyleImage: string;
    variants: ProductVariant[];
    isFeatured: boolean;
    hasVictorianFrame: boolean;
  }>({
    title: '',
    slug: '',
    collection: 'women',
    category: 'jewelry',
    price: 2500,
    material: '925 Sterling Silver',
    description: '',
    detailsText: 'solid handcrafted finish\nno synthetic coatings\nvalley workshop forged',
    mainImage: PRESET_IMAGES[0].main,
    lifestyleImage: PRESET_IMAGES[0].lifestyle,
    variants: [
      { id: 'v1', name: 'Standard', inStock: true },
      { id: 'v2', name: 'Custom', inStock: true },
    ],
    isFeatured: false,
    hasVictorianFrame: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'mainImage' | 'lifestyleImage'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (supabase) {
        showToast('Uploading to Supabase Storage...');
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error } = await supabase.storage.from('product-images').upload(fileName, file);

        if (error) {
          console.error("Supabase upload error:", error);
          showToast(`Upload failed: ${error.message} (Please ensure "product-images" bucket exists)`);
          
          // Fallback to Base64
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setFormState((prev) => ({ ...prev, [field]: reader.result as string }));
              showToast('Fallback: Image loaded locally (Base64).');
            }
          };
          reader.readAsDataURL(file);
        } else {
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
          setFormState((prev) => ({ ...prev, [field]: publicUrl }));
          showToast('Image uploaded to Supabase successfully!');
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setFormState((prev) => ({ ...prev, [field]: reader.result as string }));
            showToast('Image uploaded and auto-fitted to standard frame!');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({ id: `cat-${Date.now().toString(36)}`,
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc.trim() || `Crafted ${newCatName.trim()} pieces`,
    });

    setNewCatName('');
    setNewCatDesc('');
    showToast(`Type / Category "${newCatName}" added successfully!`);
  };

  if (!isManagementOpen) return null;

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormState({
      title: prod.title,
      slug: prod.slug,
      collection: prod.collection,
      category: prod.category,
      price: prod.price,
      material: prod.material,
      description: prod.description,
      detailsText: prod.details ? prod.details.join('\n') : '',
      mainImage: prod.mainImage,
      lifestyleImage: prod.lifestyleImage,
      variants: prod.variants || [],
      isFeatured: !!prod.isFeatured,
      hasVictorianFrame: !!prod.hasVictorianFrame,
    });
    setActiveTab('edit');
  };

  const handleStartAdd = () => {
    setEditingProduct(null);
    setFormState({
      title: '',
      slug: '',
      collection: 'women',
      category: 'jewelry',
      price: 2900,
      material: 'Handforged Silver',
      description: 'A newly added piece forged in our studio.',
      detailsText: '925 Sterling Silver\nHandcrafted in small batches\nSmooth polished finish',
      mainImage: PRESET_IMAGES[0].main,
      lifestyleImage: PRESET_IMAGES[0].lifestyle,
      variants: [
        { id: 'v1', name: 'Size 6', inStock: true },
        { id: 'v2', name: 'Size 7', inStock: true },
      ],
      isFeatured: true,
      hasVictorianFrame: true,
    });
    setActiveTab('add');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.title.trim()) {
      alert('Please enter a product title.');
      return;
    }

    const detailsArray = formState.detailsText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const generatedSlug =
      formState.slug.trim() ||
      formState.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (activeTab === 'edit' && editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: formState.title.toUpperCase(),
        slug: generatedSlug,
        collection: formState.collection,
        category: formState.category,
        price: Number(formState.price) || 0,
        material: formState.material,
        description: formState.description,
        details: detailsArray.length > 0 ? detailsArray : ['handcrafted piece'],
        mainImage: formState.mainImage,
        lifestyleImage: formState.lifestyleImage,
        variants: formState.variants.length > 0 ? formState.variants : [{ id: 'v1', name: 'Standard', inStock: true }],
        isFeatured: formState.isFeatured,
        hasVictorianFrame: formState.hasVictorianFrame,
      };

      updateProduct(updated);
      showToast(`Updated "${updated.title}"`);
      setActiveTab('list');
    } else {
      const newProd: Omit<Product, 'id'> = {
        title: formState.title.toUpperCase(),
        slug: generatedSlug,
        collection: formState.collection,
        category: formState.category,
        price: Number(formState.price) || 0,
        material: formState.material,
        description: formState.description || 'handcrafted catalogue addition',
        details: detailsArray.length > 0 ? detailsArray : ['handcrafted piece'],
        mainImage: formState.mainImage,
        lifestyleImage: formState.lifestyleImage,
        variants: formState.variants.length > 0 ? formState.variants : [{ id: 'v1', name: 'Standard', inStock: true }],
        isFeatured: formState.isFeatured,
        hasVictorianFrame: formState.hasVictorianFrame,
      };

      addProduct(newProd);
      showToast(`Added "${newProd.title}" to catalogue`);
      setActiveTab('list');
    }
  };

  const handleAddVariant = () => {
    const newId = `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setFormState({
      ...formState,
      variants: [...formState.variants, { id: newId, name: `Variant ${formState.variants.length + 1}`, inStock: true }],
    });
  };

  const handleRemoveVariant = (id: string) => {
    setFormState({
      ...formState,
      variants: formState.variants.filter((v) => v.id !== id),
    });
  };

  const handleToggleVariantStock = (id: string) => {
    setFormState({
      ...formState,
      variants: formState.variants.map((v) => (v.id === id ? { ...v, inStock: !v.inStock } : v)),
    });
  };

  const handleVariantNameChange = (id: string, newName: string) => {
    setFormState({
      ...formState,
      variants: formState.variants.map((v) => (v.id === id ? { ...v, name: newName } : v)),
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCol = filterCollection === 'all' || p.collection === filterCollection;
    return matchesSearch && matchesCol;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border-main)] bg-[var(--card-bg)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--border-maroon)] text-white flex items-center justify-center shadow-xs font-bold text-sm">
                D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-extrabold uppercase tracking-wide text-[var(--text-dominant)]">
                    DAPMAT Management Panel
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[var(--border-maroon)]/15 text-[var(--border-maroon)] font-bold border border-[var(--border-maroon)]/30">
                    Prototype Mode
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[var(--border-maroon)] inline" /> Triggered by secret keystroke sequence <code className="font-mono bg-[var(--card-inner)] px-1 rounded text-[var(--text-dominant)]">DAPMAT</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartAdd}
                className="px-3 py-1.5 rounded-full bg-[var(--border-maroon)] text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Item</span>
              </button>

              <button
                onClick={() => setIsManagementOpen(false)}
                className="w-8 h-8 rounded-full border border-[var(--border-main)] hover:bg-[var(--border-maroon)] hover:text-white transition-all flex items-center justify-center text-xs text-[var(--text-muted)]"
                title="Close Management Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between px-5 py-2 border-b border-[var(--border-main)] bg-[var(--card-inner)] shrink-0 text-xs font-medium">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'list'
                    ? 'bg-[var(--border-maroon)] text-white font-semibold'
                    : 'hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Catalogue ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-[var(--border-maroon)] text-white font-semibold'
                    : 'hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Tags className="w-3.5 h-3.5" />
                <span>Types & Categories ({categories.length})</span>
              </button>

              <button
                onClick={handleStartAdd}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'add'
                    ? 'bg-[var(--border-maroon)] text-white font-semibold'
                    : 'hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>

              {activeTab === 'edit' && (
                <span className="px-3 py-1.5 rounded-lg bg-[var(--border-maroon)] text-white font-semibold flex items-center gap-1.5">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editing: {editingProduct?.title}</span>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                resetProductsToDefault();
                showToast('Catalogue reset to default state');
                setActiveTab('list');
              }}
              className="text-[11px] text-[var(--text-muted)] hover:text-red-500 flex items-center gap-1 transition-colors underline"
              title="Reset all changes"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-[var(--border-maroon)] text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> {toastMessage}
              </span>
            </div>
          )}

          {/* Main Body */}
          <div className="p-5 overflow-y-auto flex-1">
            {/* TAB 1: LIST VIEW */}
            {activeTab === 'list' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products by title, category or material..."
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-maroon)]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-muted)] font-medium">Collection:</span>
                    {(['all', 'women', 'men', 'both'] as const).map((col) => (
                      <button
                        key={col}
                        onClick={() => setFilterCollection(col)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium lowercase transition-all ${
                          filterCollection === col
                            ? 'bg-[var(--border-maroon)] text-white font-semibold'
                            : 'bg-[var(--card-bg)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Grid / List Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex gap-3 p-3 rounded-xl border border-[var(--border-main)] bg-[var(--card-bg)] hover:border-[var(--border-maroon)]/60 transition-all group relative overflow-hidden"
                    >
                      <img
                        src={prod.mainImage}
                        alt={prod.title}
                        className="w-20 h-24 object-cover rounded-lg border border-[var(--border-main)] shrink-0 bg-[var(--card-inner)]"
                      />

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-display text-xs font-bold uppercase truncate text-[var(--text-dominant)]">
                              {prod.title}
                            </h3>
                            <span className="text-xs font-semibold text-[var(--border-maroon)] shrink-0">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1 my-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--card-inner)] border border-[var(--border-main)] uppercase text-[var(--text-muted)] font-medium">
                              {prod.collection}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--card-inner)] border border-[var(--border-main)] lowercase text-[var(--text-muted)] font-medium">
                              {prod.category}
                            </span>
                            {prod.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
                                featured
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 italic font-serif">
                            {prod.material}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-main)]/50 mt-1">
                          <button
                            onClick={() => {
                              openProductModal(prod);
                              setIsManagementOpen(false);
                            }}
                            className="px-2 py-1 rounded bg-[var(--card-inner)] hover:bg-[var(--border-main)] text-[10px] font-semibold flex items-center gap-1 text-[var(--text-primary)] transition-all"
                            title="Preview product on store modal"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>

                          <button
                            onClick={() => handleStartEdit(prod)}
                            className="px-2 py-1 rounded bg-[var(--border-maroon)] text-white hover:opacity-90 text-[10px] font-semibold flex items-center gap-1 transition-all"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>

                          <button
                            onClick={() => {
                              removeProduct(prod.id);
                              showToast(`Removed "${prod.title}"`);
                            }}
                            className="px-2 py-1 rounded hover:bg-red-500/10 text-red-500 hover:text-red-600 text-[10px] font-semibold flex items-center gap-1 transition-all ml-auto"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-[var(--border-main)] rounded-2xl p-6 bg-[var(--card-bg)]">
                    <p className="text-xs text-[var(--text-muted)] mb-3">No products match your search/filter.</p>
                    <button
                      onClick={handleStartAdd}
                      className="px-4 py-2 rounded-full bg-[var(--border-maroon)] text-white text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Product
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TYPES & CATEGORIES MANAGEMENT */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-main)] space-y-4">
                  <div className="flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-[var(--border-maroon)]" />
                    <h3 className="font-bold text-sm text-[var(--text-dominant)] uppercase tracking-wider">
                      Create Available Item Type / Category
                    </h3>
                  </div>

                  <form onSubmit={handleAddCategorySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jewelry, Ceramics, Leather..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full bg-[var(--card-inner)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[var(--border-maroon)]"
                        required
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Description (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Tactile handforged goods..."
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        className="w-full bg-[var(--card-inner)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[var(--border-maroon)]"
                      />
                    </div>

                    <div className="flex items-end sm:col-span-1">
                      <button
                        type="submit"
                        className="w-full bg-[var(--border-maroon)] text-white font-semibold py-2 px-4 rounded-xl text-xs hover:opacity-90 transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Category Type</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Categories List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Active Store Categories ({categories.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const itemCount = products.filter((p) => p.category === cat.slug).length;
                      return (
                        <div
                          key={cat.id}
                          className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-main)] flex items-center justify-between gap-3 shadow-xs hover:border-[var(--border-maroon)]/50 transition-all"
                        >
                          <div>
                            <span className="font-bold text-xs text-[var(--text-dominant)] block">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                              slug: {cat.slug}
                            </span>
                            <span className="text-[11px] text-[var(--border-maroon)] font-semibold mt-1 block">
                              {itemCount} active item{itemCount === 1 ? '' : 's'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (categories.length <= 1) {
                                  showToast('At least one category must remain.');
                                  return;
                                }
                                removeCategory(cat.id);
                                showToast(`Category "${cat.name}" removed.`);
                              }}
                              className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADD / EDIT FORM */}
            {(activeTab === 'add' || activeTab === 'edit') && (
              <form onSubmit={handleSaveForm} className="space-y-5 max-w-3xl mx-auto">
                <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase text-[var(--text-dominant)]">
                      {activeTab === 'edit' ? `Edit Product: ${editingProduct?.title}` : 'Add New Catalogue Product'}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Fill out product details to immediately publish or update item on Matilda site.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
                  >
                    Back to List
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      placeholder="e.g. HEAVY SILVER CHAIN"
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[var(--border-maroon)]"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formState.slug}
                      onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                      placeholder="heavy-silver-chain (auto-generated if empty)"
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--border-maroon)]"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={formState.price}
                      onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-semibold text-[var(--border-maroon)] focus:outline-none focus:border-[var(--border-maroon)]"
                    />
                  </div>

                  {/* Material */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Material / Specification
                    </label>
                    <input
                      type="text"
                      value={formState.material}
                      onChange={(e) => setFormState({ ...formState, material: e.target.value })}
                      placeholder="e.g. 925 Sterling Silver, Raw Stoneware"
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[var(--border-maroon)]"
                    />
                  </div>

                  {/* Collection */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Collection
                    </label>
                    <select
                      value={formState.collection}
                      onChange={(e) =>
                        setFormState({ ...formState, collection: e.target.value as 'women' | 'men' | 'both' })
                      }
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[var(--border-maroon)]"
                    >
                      <option value="women">Women's (Ivory)</option>
                      <option value="men">Men's (Charcoal)</option>
                      <option value="both">Both / Unisex</option>
                    </select>
                  </div>

                  {/* Dynamic Category Selection */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Category / Type
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('categories')}
                        className="text-[10px] text-[var(--border-maroon)] hover:underline font-bold"
                      >
                        ＋ Manage Types
                      </button>
                    </div>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[var(--border-maroon)] capitalize"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Narrative / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Short narrative describing the piece..."
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl p-3 text-xs focus:outline-none focus:border-[var(--border-maroon)]"
                  />
                </div>

                {/* Bullet Details */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Product Specifications / Bullet points (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formState.detailsText}
                    onChange={(e) => setFormState({ ...formState, detailsText: e.target.value })}
                    placeholder="solid 925 sterling silver&#10;no nickel or synthetic coats&#10;hand finished link by link"
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-main)] rounded-xl p-3 text-xs focus:outline-none focus:border-[var(--border-maroon)] font-mono"
                  />
                </div>

                {/* Image Uploads & Presets */}
                <div className="space-y-3 bg-[var(--card-inner)] p-4 rounded-xl border border-[var(--border-main)]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-dominant)] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[var(--border-maroon)]" /> Product Imagery & Auto-Fitting
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">Upload local files or choose stock presets</span>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-2 py-1">
                    <span className="text-[11px] text-[var(--text-muted)] self-center font-medium">Quick Presets:</span>
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() =>
                          setFormState({
                            ...formState,
                            mainImage: preset.main,
                            lifestyleImage: preset.lifestyle,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border-main)] hover:border-[var(--border-maroon)] text-[11px] font-medium text-[var(--text-primary)] transition-all"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* File Upload Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Main Image */}
                    <div className="space-y-2 bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-main)]/50">
                      <label className="text-[11px] font-bold text-[var(--text-dominant)] block">Main Product Image</label>
                      
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[var(--border-maroon)] text-white text-[11px] font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'mainImage')}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-[var(--text-muted)]">or paste URL:</span>
                      </div>

                      <input
                        type="text"
                        value={formState.mainImage}
                        onChange={(e) => setFormState({ ...formState, mainImage: e.target.value })}
                        className="w-full bg-[var(--card-inner)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[var(--border-maroon)] font-mono"
                        placeholder="https://..."
                      />
                    </div>

                    {/* Lifestyle Image */}
                    <div className="space-y-2 bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-main)]/50">
                      <label className="text-[11px] font-bold text-[var(--text-dominant)] block">Lifestyle Hover Image</label>
                      
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[var(--border-maroon)] text-white text-[11px] font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'lifestyleImage')}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-[var(--text-muted)]">or paste URL:</span>
                      </div>

                      <input
                        type="text"
                        value={formState.lifestyleImage}
                        onChange={(e) => setFormState({ ...formState, lifestyleImage: e.target.value })}
                        className="w-full bg-[var(--card-inner)] border border-[var(--border-main)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[var(--border-maroon)] font-mono"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Image Previews - Enforced 1:1 ratio */}
                  <div className="flex gap-4 pt-2 border-t border-[var(--border-main)]/50">
                    <div className="flex items-center gap-2 text-xs">
                      <img
                        src={formState.mainImage}
                        alt="Main preview"
                        className="w-14 h-14 aspect-square object-cover rounded-xl border border-[var(--border-main)]"
                        onError={(e) => (e.currentTarget.src = PRESET_IMAGES[0].main)}
                      />
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">Main 1:1 Preview</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <img
                        src={formState.lifestyleImage}
                        alt="Lifestyle preview"
                        className="w-14 h-14 aspect-square object-cover rounded-xl border border-[var(--border-main)]"
                        onError={(e) => (e.currentTarget.src = PRESET_IMAGES[0].lifestyle)}
                      />
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">Lifestyle 1:1 Preview</span>
                    </div>
                  </div>
                </div>

                {/* Variants Manager */}
                <div className="space-y-2 bg-[var(--card-inner)] p-4 rounded-xl border border-[var(--border-main)]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-dominant)]">
                      Sizing / Stock Variants
                    </label>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-2.5 py-1 rounded bg-[var(--card-bg)] border border-[var(--border-main)] hover:border-[var(--border-maroon)] text-[11px] font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Variant
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {formState.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center gap-2 bg-[var(--card-bg)] p-2 rounded-lg border border-[var(--border-main)]"
                      >
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleVariantNameChange(variant.id, e.target.value)}
                          placeholder="Variant name (e.g., Size 7, 18 inch)"
                          className="flex-1 bg-transparent border-none text-xs font-medium focus:outline-none"
                        />

                        <label className="flex items-center gap-1 text-[11px] font-medium cursor-pointer text-[var(--text-muted)] select-none">
                          <input
                            type="checkbox"
                            checked={variant.inStock}
                            onChange={() => handleToggleVariantStock(variant.id)}
                            className="rounded accent-[var(--border-maroon)]"
                          />
                          <span>In Stock</span>
                        </label>

                        {formState.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="p-1 hover:text-red-500 text-[var(--text-muted)] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={formState.isFeatured}
                      onChange={(e) => setFormState({ ...formState, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--border-maroon)]"
                    />
                    <span>Highlight as Featured Product</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={formState.hasVictorianFrame}
                      onChange={(e) => setFormState({ ...formState, hasVictorianFrame: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--border-maroon)]"
                    />
                    <span>Show Victorian Aesthetic Frame</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-main)]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 rounded-full border border-[var(--border-main)] text-xs font-semibold hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[var(--border-maroon)] text-white text-xs font-bold hover:opacity-90 transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{activeTab === 'edit' ? 'Save Changes' : 'Publish Product'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
