import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../data/products';

export const useAdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    let loadedProducts: any[] = [];

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/products', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          loadedProducts = data;
        }
      }
    } catch (err: any) {
      console.warn('Backend products fetch failed, attempting client fallback...', err);
    }

    // Direct Supabase fallback if backend returned empty
    if (loadedProducts.length === 0 && supabase) {
      try {
        const { data, error: sbError } = await supabase.from('products').select('*');
        if (!sbError && data && data.length > 0) {
          loadedProducts = data.map((p: any) => ({
            id: p.id,
            slug: p.slug || p.id,
            title: p.title || p.name,
            collection: p.collection || 'women',
            category: p.category || 'general',
            price: Number(p.price || 0),
            stock_count: Number(p.stock_count || 0),
            description: p.description || '',
            details: Array.isArray(p.details) ? p.details : [],
            mainImage: p.mainImage || p.image_url || '',
            lifestyleImage: p.lifestyleImage || p.hover_image_url || p.mainImage || '',
            galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
            imageFit: p.imageFit || 'cover',
            isFeatured: !!p.isFeatured,
            hasVictorianFrame: !!p.hasVictorianFrame,
            variants: Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [{ id: 'v1', name: 'One Size', inStock: true }],
            material: p.material || ''
          }));
        }
      } catch (sbErr) {
        console.warn('Supabase direct fetch failed', sbErr);
      }
    }

    // LocalStorage fallback
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

    // Default static fallback
    if (loadedProducts.length === 0) {
      loadedProducts = PRODUCTS;
    }

    setProducts(loadedProducts);
    setLoading(false);
  }, []);

  const saveProduct = async (productData: any, id?: string) => {
    const token = localStorage.getItem('admin_token');
    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';
    
    const filteredVariants = productData.variants.filter((v: any) => v.name.trim() !== '');
    const payload = {
      ...productData,
      details: productData.details.filter((d: string) => d.trim() !== ''),
      galleryImages: productData.galleryImages.filter((g: string) => g.trim() !== ''),
      variants: filteredVariants.length > 0 ? filteredVariants : [{ id: 'v1', name: 'One Size', inStock: true }]
    };

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to save product');
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    
    if (!res.ok) throw new Error('Failed to delete product');
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
