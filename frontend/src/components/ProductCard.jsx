import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../context/LangContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { imgUrl } from '../data/products.js';
import { categories } from '../i18n/translations.js';
import { categoryIcons } from '../data/categoryIcons.js';
import { triggerSplash } from '../lib/splash.js';

function stars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

const voirLabel = { fr: 'Voir', en: 'View', ar: 'عرض' };

export default function ProductCard({ product, autoOpen = false }) {
  const { t, lang } = useLang();
  const { addToCart } = useCart();
  const { compareIds, toggleCompare, maxCompare } = useCompare();
  const [showDetail, setShowDetail] = useState(false);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [qty, setQty] = useState(1);
  const ripplesRef = useRef(null);
  const catObj = categories.find((c) => c.value === product.cat);

  const isComparing = compareIds.includes(product.id);
  const compareDisabled = !isComparing && compareIds.length >= maxCompare;

  const outOfStock = product.inStock === false;

  const photoSrc = product.hasRealPhoto
    ? (product.isCustom ? product.image : imgUrl(product.image))
    : categoryIcons[product.cat] || '/product-images/placeholder.svg';

  const openDetail = () => {
    setQty(1);
    setShowDetail(true);
    setClosing(false);
    setEntered(false);
    setTimeout(() => setEntered(true), 20);
  };

  useEffect(() => {
    if (autoOpen) {
      openDetail();
      requestAnimationFrame(() => {
        const el = document.getElementById(`product-${product.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  useEffect(() => {
    if (showDetail) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showDetail]);

  const closeDetail = () => {
    const ripplesWrap = ripplesRef.current;
    if (ripplesWrap) {
      for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.style.position = 'absolute';
        ring.style.left = '50%';
        ring.style.top = '50%';
        ring.style.width = '20px';
        ring.style.height = '20px';
        ring.style.marginLeft = '-10px';
        ring.style.marginTop = '-10px';
        ring.style.border = '2px solid #6EC8E6';
        ring.style.borderRadius = '50%';
        ring.style.opacity = '0.8';
        ring.style.pointerEvents = 'none';
        ring.style.transition = `transform 0.7s ease-out ${i * 0.12}s, opacity 0.7s ease-out ${i * 0.12}s`;
        ripplesWrap.appendChild(ring);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          ring.style.transform = 'scale(9)';
          ring.style.opacity = '0';
        }));
        setTimeout(() => ring.remove(), 900 + i * 120);
      }
    }
    setClosing(true);
    setTimeout(() => setShowDetail(false), 550);
  };

  const handleAddToCart = (e) => {
    if (outOfStock) return;
    const rect = e.currentTarget.getBoundingClientRect();
    triggerSplash(rect.left + rect.width / 2, rect.top);
    for (let i = 0; i < qty; i++) addToCart(product);
  };

  return (
    <>
      <div
        id={`product-${product.id}`}
        className={`bg-white border border-ink/10 rounded overflow-hidden flex flex-col transition ${
          outOfStock ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'
        }`}
      >
        <div
          className="relative aspect-[10/9] overflow-hidden bg-aqua cursor-pointer"
          onClick={openDetail}
        >
          <img
            src={photoSrc}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover ${outOfStock ? 'grayscale' : ''}`}
            onError={(e) => { e.currentTarget.src = '/product-images/placeholder.svg'; }}
          />
          {!outOfStock && (
            <div className="absolute top-3 left-3 bg-gold text-ink text-xs font-bold w-11 h-11 rounded-full flex items-center justify-center">
              -{product.discount}%
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
              <span className="bg-ink/80 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Rupture de stock
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="text-xs uppercase tracking-wide text-tealLight font-semibold">
            {catObj ? (catObj[lang] || catObj.fr) : product.cat}
          </div>
          <div className="text-sm font-semibold leading-tight">{product.name}</div>
          <p className="text-xs text-ink/60 leading-snug line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-1 text-xs text-ink/55">
            <span className="text-gold tracking-wider">{stars(product.rating)}</span>
            {product.rating} ({product.reviews} {t('reviews_word')})
          </div>
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            <span className="text-xs text-ink/40 line-through font-mono">{product.old} د.ت</span>
            <span className="font-mono text-lg font-semibold text-tealDeep">{product.price} د.ت</span>
          </div>

          <label className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded border cursor-pointer select-none transition ${
            isComparing
              ? 'bg-teal text-white border-teal'
              : compareDisabled
              ? 'text-ink/30 border-ink/10 cursor-not-allowed'
              : 'text-ink/70 border-ink/15 hover:border-teal'
          }`}>
            <input
              type="checkbox"
              checked={isComparing}
              disabled={compareDisabled}
              onChange={() => toggleCompare(product.id)}
              className="w-3.5 h-3.5 accent-teal"
            />
            ⚖️ {isComparing ? 'Ajouté à comparer' : 'Ajouter à comparer'}
          </label>

          <div className="flex gap-2 mt-1">
            <button
              onClick={openDetail}
              className="flex-1 py-2.5 border border-ink/15 text-ink text-sm font-semibold rounded hover:border-teal transition"
            >
              {voirLabel[lang] || voirLabel.fr}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 py-2.5 bg-mineral2 text-tealDeep text-sm font-semibold rounded hover:bg-teal hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-mineral2 disabled:hover:text-tealDeep"
            >
              {outOfStock ? 'Indisponible' : t('add_to_cart')}
            </button>
          </div>
        </div>
      </div>

      {showDetail && createPortal(
        <div
          className="fixed inset-0 bg-ink/60 z-[260] flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div ref={ripplesRef} className="absolute inset-0 pointer-events-none" />

          <div
            className="relative bg-white rounded-2xl overflow-hidden w-[90vw] h-[88vh] max-w-6xl flex flex-col sm:flex-row"
            style={{
              transform: closing
                ? 'scale(0.05) rotate(420deg)'
                : entered
                ? 'translate(0, 0) rotate(0deg) scale(1)'
                : 'translate(-55vw, -35vh) rotate(-30deg) scale(0.55)',
              opacity: closing ? 0 : 1,
              transition: closing
                ? 'transform 0.55s cubic-bezier(.6,-0.2,.8,.2), opacity 0.5s ease 0.1s'
                : 'transform 0.6s cubic-bezier(.17,.89,.32,1.28), opacity 0.3s ease',
              transformOrigin: 'center',
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeDetail(); }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-lg z-10"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div
              className="relative sm:w-1/2 h-48 sm:h-full flex-shrink-0 bg-aqua cursor-zoom-in group"
              onClick={() => setShowLightbox(true)}
            >
              <img src={photoSrc} alt={product.name} className={`w-full h-full object-cover ${outOfStock ? 'grayscale' : ''}`} />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-2xl">🔍</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 sm:w-1/2 flex-1 min-h-0 overflow-y-auto">
              <div className="text-xs uppercase tracking-wide text-tealLight font-semibold mb-2">
                {catObj ? (catObj[lang] || catObj.fr) : product.cat}
              </div>
              <h3 className="text-2xl font-bold mb-4">{product.name}</h3>

              {outOfStock && (
                <div className="bg-ink/10 text-ink/70 text-sm font-semibold px-3 py-2 rounded mb-4 inline-block">
                  ⚠️ Rupture de stock — disponible bientôt
                </div>
              )}

              <hr className="border-ink/10 mb-5" />

              <p className="text-sm text-ink/70 mb-5 leading-relaxed">{product.description}</p>

              {product.specs && product.specs.length > 0 && (
                <ul className="space-y-3 mb-6">
                  {product.specs.map((s, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-semibold text-tealDeep">{s.label}</span>
                      {' — '}
                      <span className="text-ink/70">{s.value}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-1 text-xs text-ink/55 mb-6">
                <span className="text-gold tracking-wider">{stars(product.rating)}</span>
                {product.rating} ({product.reviews} {t('reviews_word')})
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={outOfStock}
                    className="w-9 h-9 rounded-full border border-ink/15 text-lg font-semibold hover:border-teal transition disabled:opacity-40"
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="text-base font-semibold min-w-[20px] text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    disabled={outOfStock}
                    className="w-9 h-9 rounded-full border border-ink/15 text-lg font-semibold hover:border-teal transition disabled:opacity-40"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-ink/40 line-through font-mono">{product.old} د.ت</span>
                  <span className="font-mono text-2xl font-semibold text-tealDeep">{product.price * qty} د.ت</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="w-full py-3.5 bg-teal text-white font-semibold rounded hover:bg-tealLight transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {outOfStock ? 'Indisponible' : t('add_to_cart')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showLightbox && createPortal(
        <div
          className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setShowLightbox(false); }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setShowLightbox(false); }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg z-10"
            aria-label="Fermer"
          >
            ✕
          </button>
          <img
            src={photoSrc}
            alt={product.name}
            className="w-screen h-screen object-contain pointer-events-none"
          />
        </div>,
        document.body
      )}
    </>
  );
}

