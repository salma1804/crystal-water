import React from 'react';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';

export default function CompareModal({ items, onClose }) {
  const allLabels = Array.from(
    new Set(items.flatMap((p) => (p.specs || []).map((s) => s.label)))
  );

  const getSpecValue = (product, label) => {
    const spec = (product.specs || []).find((s) => s.label === label);
    return spec ? spec.value : '—';
  };

  return (
    <div
      className="fixed inset-0 bg-ink/60 z-[250] flex items-center justify-center p-4"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10 flex-shrink-0">
          <h3 className="text-lg font-bold">Comparer les produits</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-mineral2 flex items-center justify-center text-ink/60 hover:text-ink transition"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto flex-1 p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-40 text-left" />
                {items.map((p) => {
                  const photoSrc = p.hasRealPhoto ? imgUrl(p.image) : categoryIcons[p.cat] || '/product-images/placeholder.svg';
                  return (
                    <th key={p.id} className="text-left px-3 pb-4 align-top" style={{ minWidth: 200 }}>
                      <img src={photoSrc} alt={p.name} className="w-full h-32 object-cover rounded-lg bg-aqua mb-2" />
                      <div className="text-sm font-semibold leading-snug mb-1">{p.name}</div>
                      <div className="font-mono text-base font-bold text-tealDeep">{p.price} د.ت</div>
                      {p.discount > 0 && (
                        <div className="text-xs text-ink/40 line-through font-mono">{p.old} د.ت</div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-ink/10">
                <td className="py-3 text-xs font-semibold text-ink/50 uppercase tracking-wide">Description</td>
                {items.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-xs text-ink/70 align-top">
                    {p.description || '—'}
                  </td>
                ))}
              </tr>
              {allLabels.map((label) => (
                <tr key={label} className="border-t border-ink/10">
                  <td className="py-3 text-xs font-semibold text-ink/50 uppercase tracking-wide align-top">{label}</td>
                  {items.map((p) => (
                    <td key={p.id} className="py-3 px-3 text-sm text-ink/80 align-top">
                      {getSpecValue(p, label)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-ink/10">
                <td className="py-3 text-xs font-semibold text-ink/50 uppercase tracking-wide">Note</td>
                {items.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-sm text-ink/80">
                    {p.rating > 0 ? `${p.rating} ★ (${p.reviews} avis)` : 'Pas encore noté'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}