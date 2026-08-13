import React, { createContext, useContext, useState, useEffect } from 'react';
import { CollectionType, Product, ProductVariant, CartItem, CategoryOption } from '../types';
import { PRODUCTS } from '../data/products';
import { supabase } from '../lib/supabase';

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 'cat-jewelry', name: 'Jewelry', slug: 'jewelry', description: 'Silver, gold & metalwork' },
  { id: 'cat-ceramics', name: 'Ceramics', slug: 'ceramics', description: 'Wheel-thrown clay & stoneware' },
  { id: 'cat-apparel', name: 'Apparel', slug: 'apparel', description: 'Woven linen & heavy cotton' },
  { id: 'cat-editorial', name: 'Editorial', slug: 'editorial', description: 'Journals, vinyl & art prints' },
];

interface CollectionContextType {
  collection: CollectionType;
  setCollection: (c: CollectionType) => void;
  toggleCollection: () => void;
  isLoading: boolean;
  
  // Page View Mode (Brand Home vs Dedicated Shop Page)
  viewMode: 'brand' | 'shop';
  setViewMode: (mode: 'brand' | 'shop') => void;
  openShop: (col?: CollectionType) => void;
  openBrand: () => void;
  
  // Catalogue Management
  products: Product[];
  addProduct: (newProduct: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (updatedProduct: Product) => void;
  removeProduct: (productId: string) => void;
  resetProductsToDefault: () => void;
  isManagementOpen: boolean;
  setIsManagementOpen: (open: boolean) => void;
  toggleManagement: () => void;

  // Category / Type Management
  categories: CategoryOption[];
  addCategory: (cat: CategoryOption) => void;
  updateCategory: (cat: CategoryOption) => void;
  removeCategory: (catId: string) => void;
  resetCategoriesToDefault: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, delta: number) => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Modals
  selectedProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  
  isSayHelloOpen: boolean;
  setIsSayHelloOpen: (open: boolean) => void;

  // Dynamic Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Checkout Handoff
  isCheckoutHandoff: boolean;
  triggerCheckoutHandoff: () => void;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collection, setCollectionState] = useState<CollectionType>('women');
  const [viewMode, setViewMode] = useState<'brand' | 'shop'>('brand');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSayHelloOpen, setIsSayHelloOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCheckoutHandoff, setIsCheckoutHandoff] = useState<boolean>(false);

  const openShop = (col?: CollectionType) => {
    if (col) {
      setCollectionState(col);
    }
    setViewMode('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'shop');
    if (col) url.searchParams.set('collection', col);
    window.history.pushState({}, '', url.toString());
  };

  const openBrand = () => {
    setCollectionState('women');
    setViewMode('brand');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'brand');
    url.searchParams.set('collection', 'women');
    window.history.pushState({}, '', url.toString());
  };
  
  // DAPMAT Catalogue & Categories Management State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('matilda_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            id: p.id || `matilda-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
            variants: Array.isArray(p.variants) ? p.variants.map((v: any, idx: number) => ({
              ...v,
              id: v.id || `v${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${idx}`
            })) : []
          })) as Product[];
        }
      }
    } catch {
      // ignore
    }
    return PRODUCTS;
  });

  const [categories, setCategories] = useState<CategoryOption[]>(() => {
    try {
      const saved = localStorage.getItem('matilda_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any, idx: number) => ({
            ...c,
            id: c.id || `cat-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}-${idx}`
          })) as CategoryOption[];
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_CATEGORIES;
  });

  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);

  // Sync products and categories to local storage (Fallback)
  useEffect(() => {
    try {
      localStorage.setItem('matilda_products', JSON.stringify(products));
    } catch (err) {
      console.error('Failed to save products to localStorage', err);
    }
  }, [products]);

  // Load from Supabase on mount if available
  useEffect(() => {
    if (supabase) {
      supabase.from('products').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setProducts(data as Product[]);
        }
      });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('matilda_categories', JSON.stringify(categories));
    } catch (err) {
      console.error('Failed to save categories to localStorage', err);
    }
  }, [categories]);

  const addCategory = (newCat: CategoryOption) => {
    setCategories((prev) => {
      if (prev.some((c) => c.slug === newCat.slug || c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });
  };

  const updateCategory = (updatedCat: CategoryOption) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const removeCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const resetCategoriesToDefault = () => {
    setCategories(DEFAULT_CATEGORIES);
    try {
      localStorage.removeItem('matilda_categories');
    } catch {
      // ignore
    }
  };

  // Global Keypress listener for secret sequence "dapmat"
  useEffect(() => {
    let keySequence = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key.length > 1) return;

      keySequence = (keySequence + e.key.toLowerCase()).slice(-10);
      if (keySequence.endsWith('dapmat')) {
        setIsManagementOpen((prev) => !prev);
        keySequence = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addProduct = async (newProductData: Omit<Product, 'id'> & { id?: string }) => {
    const id = newProductData.id || `matilda-${Date.now().toString(36)}`;
    const product: Product = { ...newProductData, id };
    setProducts((prev) => [product, ...prev]);

    if (supabase) {
      const { error } = await supabase.from('products').insert([product]);
      if (error) console.error('Failed to save product to Supabase', error);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    if (selectedProduct?.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }

    if (supabase) {
      const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
      if (error) console.error('Failed to update product in Supabase', error);
    }
  };

  const removeProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }

    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) console.error('Failed to delete product from Supabase', error);
    }
  };

  const resetProductsToDefault = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem('matilda_products');
    } catch {
      // ignore
    }
  };

  const toggleManagement = () => setIsManagementOpen((prev) => !prev);

  // Set html data-collection attribute on mount, viewMode change and collection change
  useEffect(() => {
    const activeTheme = (viewMode === 'shop' && collection === 'men') ? 'men' : 'women';
    document.documentElement.setAttribute('data-collection', activeTheme);
  }, [collection, viewMode]);

  // Preloader timeout and font load detection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Listen to URL search params for product shallow routing & view mode
  useEffect(() => {
    const handleUrlSync = () => {
      const params = new URLSearchParams(window.location.search);
      const productSlug = params.get('product');
      const colParam = params.get('collection');
      const viewParam = params.get('view');

      if (viewParam === 'shop' || productSlug) {
        setViewMode('shop');
      } else if (viewParam === 'brand') {
        setViewMode('brand');
        if (!colParam) {
          setCollectionState('women');
        }
      }

      if (colParam === 'women' || colParam === 'men') {
        setCollectionState(colParam);
      }

      if (productSlug) {
        const found = products.find((p) => p.slug === productSlug || p.id === productSlug);
        if (found) {
          setSelectedProduct(found);
        }
      } else {
        setSelectedProduct(null);
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, [products]);

  const setCollection = (newCollection: CollectionType) => {
    setCollectionState(newCollection);
    const url = new URL(window.location.href);
    url.searchParams.set('collection', newCollection);
    window.history.pushState({}, '', url.toString());
  };

  const toggleCollection = () => {
    const next = collection === 'women' ? 'men' : 'women';
    setCollection(next);
  };

  // Shallow routing modal triggers
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    const url = new URL(window.location.href);
    url.searchParams.set('product', product.slug);
    window.history.pushState({}, '', url.toString());
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.pushState({}, '', url.toString());
  };

  // Cart operations
  const addToCart = (product: Product, variant: ProductVariant) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant.id === variant.id
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prevCart, { product, selectedVariant: variant, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.selectedVariant.id === variantId)));
  };

  const updateQuantity = (productId: string, variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedVariant.id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const triggerCheckoutHandoff = () => {
    setIsCheckoutHandoff(true);
    setTimeout(() => {
      // Complete handoff view
    }, 400);
  };

  return (
    <CollectionContext.Provider
      value={{
        collection,
        setCollection,
        toggleCollection,
        isLoading,
        viewMode,
        setViewMode,
        openShop,
        openBrand,
        products,
        addProduct,
        updateProduct,
        removeProduct,
        resetProductsToDefault,
        isManagementOpen,
        setIsManagementOpen,
        toggleManagement,
        categories,
        addCategory,
        updateCategory,
        removeCategory,
        resetCategoriesToDefault,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        openProductModal,
        closeProductModal,
        isSayHelloOpen,
        setIsSayHelloOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCheckoutHandoff,
        triggerCheckoutHandoff,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within CollectionProvider');
  }
  return context;
};
