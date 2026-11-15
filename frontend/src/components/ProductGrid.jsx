import React, { useRef } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid() {
  const { t } = useLang();
  const products = useProducts();
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
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#07222d] mb-3">{t('shop_title')}</h2>
            <div className="w-14 h-1 rounded-full bg-[#15677f] mb-3" />
            <p className="text-[#4a6670] text-base leading-relaxed max-w-md">{t('shop_sub')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Précédent"
              className="w-12 h-12 rounded-full bg-[#15677f] text-white flex items-center justify-center shadow-[0_12px_24px_-12px_rgba(21,103,127,.8)] hover:bg-[#2bb7d6] hover:text-[#07222d] hover:scale-105 active:scale-95 transition"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Suivant"
              className="w-12 h-12 rounded-full bg-[#15677f] text-white flex items-center justify-center shadow-[0_12px_24px_-12px_rgba(21,103,127,.8)] hover:bg-[#2bb7d6] hover:text-[#07222d] hover:scale-105 active:scale-95 transition"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
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