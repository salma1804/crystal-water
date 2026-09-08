import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const products = useProducts();

  const normalizedQuery = normalize(query.trim());

  const results =
    normalizedQuery.length > 1
      ? products
          .filter((p) => normalize(p.name).includes(normalizedQuery))
          .slice(0, 8)
      : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToProduct = (p) => {
    setOpen(false);
    setQuery('');
    navigate(`/categorie/${p.cat}?openProduct=${p.id}`);
  };

  return (
    <div ref={wrapRef} className={`relative w-full max-w-sm ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un produit..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-ink/15 text-sm bg-white focus:outline-none focus:border-teal transition"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {open && normalizedQuery.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-ink/10 rounded-lg shadow-xl max-h-96 overflow-y-auto z-[400]">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-ink/50 text-center">Aucun résultat pour "{query}"</div>
          ) : (
            results.map((p) => {
              const photoSrc = p.hasRealPhoto
                ? imgUrl(p.image)
                : categoryIcons[p.cat] || '/product-images/placeholder.svg';
              return (
                <button
                  key={p.id}
                  onClick={() => goToProduct(p)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-mineral2 transition text-left border-b border-ink/5 last:border-b-0"
                >
                  <img src={photoSrc} alt={p.name} className="w-10 h-10 rounded object-cover bg-aqua flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-ink/50">{p.price} د.ت</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}