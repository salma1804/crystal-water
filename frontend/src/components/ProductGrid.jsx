import React, { useRef } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid() {
  const { t } = useLang();
  const scrollRef = useRef(null);

  // Les articles les plus en promo, en tête de la bande
  const featured = [...products].sort((a, b) => b.discount - a.discount).slice(0, 10);

  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section id="boutique" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-8 reveal">
          <div>
            <h2 className="text-3xl font-bold mb-1">{t('shop_title')}</h2>
            <p className="text-ink/60 max-w-md text-sm">{t('shop_sub')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Précédent"
              className="w-10 h-10 rounded-full border border-ink/15 flex items-center justify-center text-teal hover:bg-teal hover:text-white hover:border-teal transition"
            >
              &lt;
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Suivant"
              className="w-10 h-10 rounded-full border border-ink/15 flex items-center justify-center text-teal hover:bg-teal hover:text-white hover:border-teal transition"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-3 px-6 max-w-6xl mx-auto"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {featured.map((p) => (
          <div key={p.id} className="w-72 flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}