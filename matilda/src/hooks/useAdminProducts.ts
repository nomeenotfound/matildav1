import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../data/products';
import { fetchAdminProducts, saveAdminProduct, deleteAdminProduct as apiDeleteAdminProduct } from '../lib/adminApi';

export const useAdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    let loadedProducts: any[] = [];

    // 1. Fetch via Express API
    try {
      const apiProds = await fetchAdminProducts();
      if (Array.isArray(apiProds) && apiProds.length > 0) {
        loadedProducts = apiProds;
      }
    } catch (e) {
      console.warn("API products fetch notice:", e);
    }

    // 2. Direct Supabase query
    if (loadedProducts.length === 0 && supabase) {
      try {
        const { data, error: sbError } = await supabase.from('products').select('*');
        if (!sbError && data && data.length > 0) {
          loadedProducts = data;
        }
      } catch (sbErr) {
        console.warn('Supabase direct fetch notice:', sbErr);
      }
    }

    // 3. LocalStorage fallback
    if (loadedProducts.length === 0) {
      try {
        const saved = localStorage.getItem('matilda_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedProducts = parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    // 4. Default static fallback
    if (loadedProducts.length === 0) {
      loadedProducts = PRODUCTS;
    }

    // Normalize format
    const normalized = loadedProducts.map((p: any) => ({
      id: p.id,
      slug: p.slug || p.id,
      title: p.title || p.name,
      collection: p.collection || 'women',
      category: p.category || 'general',
      price: Number(p.price || 0),
      stock_count: Number(p.stock_count || 0),
      description: p.description || '',
      details: Array.isArray(p.details) ? p.details : [],
      mainImage: p.mainImage || p.image || p.image_url || '',
      lifestyleImage: p.lifestyleImage || p.hover_image || p.hover_image_url || p.mainImage || '',
      galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
      imageFit: p.imageFit || 'cover',
      isFeatured: !!p.isFeatured,
      hasVictorianFrame: !!p.hasVictorianFrame,
      variants: Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [{ id: 'v1', name: 'One Size', inStock: true }],
      material: p.material || ''
    }));

    setProducts(normalized);
    setLoading(false);
  }, []);

  const saveProduct = async (productData: any, id?: string) => {
    const filteredVariants = productData.variants ? productData.variants.filter((v: any) => v.name.trim() !== '') : [];
    const payload = {
      ...productData,
      id: id || productData.id || `prod_${Date.now()}`,
      details: Array.isArray(productData.details) ? productData.details.filter((d: string) => d.trim() !== '') : [],
      galleryImages: Array.isArray(productData.galleryImages) ? productData.galleryImages.filter((g: string) => g.trim() !== '') : [],
      variants: filteredVariants.length > 0 ? filteredVariants : [{ id: 'v1', name: 'One Size', inStock: true }]
    };

    // Save via API helper
    await saveAdminProduct(payload, !!id);

    // Local storage fallback sync
    try {
      const existingStr = localStorage.getItem('matilda_products');
      let arr: any[] = existingStr ? JSON.parse(existingStr) : [...products];
      if (id) {
        arr = arr.map(p => p.id === id ? { ...p, ...payload } : p);
      } else {
        arr.unshift(payload);
      }
      localStorage.setItem('matilda_products', JSON.stringify(arr));
    } catch (e) {}

    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await apiDeleteAdminProduct(id);

    try {
      const existingStr = localStorage.getItem('matilda_products');
      let arr: any[] = existingStr ? JSON.parse(existingStr) : [...products];
      arr = arr.filter(p => p.id !== id);
      localStorage.setItem('matilda_products', JSON.stringify(arr));
    } catch (e) {}

    await fetchProducts();
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    saveProduct,
    deleteProduct
  };
};
