import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { products as staticProducts } from '../data/products.js';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [overrides, setOverrides] = useState([]);
  const [customProducts, setCustomProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOverrides = async () => {
    try {
      const res = await fetch('/api/products/overrides');
      const data = await res.json();
      setOverrides(data.overrides || []);
      setCustomProducts(data.custom || []);
    } catch (err) {
      console.error('Impossible de charger les modifications admin, catalogue de base utilisé.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverrides();
  }, []);

  const products = useMemo(() => {
    const overrideMap = new Map(overrides.map((o) => [String(o.product_id), o]));

    const merged = staticProducts.map((p) => {
      const o = overrideMap.get(String(p.id));
      if (!o) return { ...p, inStock: true };
      return {
        ...p,
        price: o.price != null ? Number(o.price) : p.price,
        old: o.old_price != null ? Number(o.old_price) : p.old,
        discount: o.discount != null ? o.discount : p.discount,
        inStock: o.in_stock !== false,
      };
    });

    const customMapped = customProducts.map((c) => ({
      id: `custom-${c.id}`,
      name: c.name,
      cat: c.cat,
      subcat: c.subcat || undefined,
      description: c.description || '',
      image: c.image || '',
      hasRealPhoto: c.has_real_photo || false,
      price: Number(c.price),
      old: Number(c.old_price || c.price),
      discount: c.discount || 0,
      rating: Number(c.rating || 0),
      reviews: c.reviews || 0,
      specs: c.specs || [],
      inStock: c.in_stock !== false,
      isCustom: true,
    }));

    return [...merged, ...customMapped];
  }, [overrides, customProducts]);

  return (
    <ProductsContext.Provider value={{ products, loading, refresh: loadOverrides }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts doit être utilisé à l'intérieur de <ProductsProvider>");
  return ctx.products;
}

export function useProductsAdmin() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProductsAdmin doit être utilisé à l'intérieur de <ProductsProvider>");
  return ctx;
}