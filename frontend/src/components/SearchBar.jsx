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
    <div ref={wrapRef} className={`relative w-full max-w-md ${className}`}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un produit, une cartouche..."
          aria-label="Rechercher un produit"
          className="w-full pl-5 pr-14 py-3 rounded-full border-[1.5px] border-[#b9d0d6] bg-white text-[15px] text-[#0e2a35] placeholder:text-[#6f8a93] shadow-[0_6px_18px_-12px_rgba(7,34,45,.5)] hover:border-[#15677f] focus:outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/25 transition"
        />
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#15677f] group-focus-within:bg-[#2bb7d6] flex items-center justify-center transition-colors pointer-events-none"
        >
          <svg className="w-[18px] h-[18px] text-white group-focus-within:text-[#07222d] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
      </div>

      {open && normalizedQuery.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#d6e3e6] rounded-2xl shadow-[0_24px_50px_-24px_rgba(7,34,45,.5)] max-h-96 overflow-y-auto z-[400]">
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
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#edf4f5] transition text-left border-b border-[#edf4f5] last:border-b-0"
                >
                  <img src={photoSrc} alt={p.name} className="w-11 h-11 rounded-xl object-cover bg-[#e3f1f4] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-sm font-bold text-[#15677f]">{p.price} د.ت</div>
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