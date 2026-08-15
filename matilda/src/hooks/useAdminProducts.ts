import { useState, useCallback } from 'react';

export const useAdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/products', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
