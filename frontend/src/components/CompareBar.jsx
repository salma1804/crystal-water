import React, { useState } from 'react';
import { useCompare } from '../context/CompareContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';
import CompareModal from './CompareModal.jsx';

export default function CompareBar() {
  const { compareIds, clearCompare, toggleCompare } = useCompare();
  const products = useProducts();
  const [modalOpen, setModalOpen] = useState(false);

  if (compareIds.length === 0) return null;

  const items = compareIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[140] bg-white border-t border-ink/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
            {items.map((p) => {
              const photoSrc = p.hasRealPhoto ? imgUrl(p.image) : categoryIcons[p.cat] || '/product-images/placeholder.svg';
              return (
                <div key={p.id} className="relative flex-shrink-0">
                  <img src={photoSrc} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-aqua border border-ink/10" />
                  <button
                    onClick={() => toggleCompare(p.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink/70 text-white text-[10px] flex items-center justify-center hover:bg-ink"
                    aria-label="Retirer de la comparaison"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <div className="flex flex-col flex-shrink-0">
              <span className="text-sm font-semibold text-ink">
                ⚖️ Comparaison ({items.length}/3)
              </span>
              <span className="text-xs text-ink/50">
                {items.length < 2 ? 'Choisissez encore un produit pour comparer' : 'Prêt à comparer'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={clearCompare}
              className="px-3 py-2 text-xs font-semibold text-ink/60 hover:text-ink transition"
            >
              Tout retirer
            </button>
            <button
              onClick={() => setModalOpen(true)}
              disabled={items.length < 2}
              className="px-5 py-2.5 bg-teal text-white text-sm font-semibold rounded hover:bg-tealLight transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Comparer ({items.length})
            </button>
          </div>
        </div>
      </div>

      {modalOpen && <CompareModal items={items} onClose={() => setModalOpen(false)} />}
    </>
  );
}