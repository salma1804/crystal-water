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
        ring.style.border = '2px solid #2bb7d6';
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
        className={`bg-white border border-[#d6e3e6] rounded-2xl overflow-hidden flex flex-col transition duration-200 ${
          outOfStock ? 'opacity-70' : 'hover:shadow-[0_18px_36px_-18px_rgba(7,34,45,.35)] hover:-translate-y-1'
        }`}
      >
        <div
          className="relative aspect-[10/9] overflow-hidden bg-gradient-to-b from-[#e3f1f4] to-[#cfe6ec] cursor-pointer"
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
            <div className="absolute top-3 left-3 bg-[#d9483b] text-white text-[13px] font-bold px-2.5 py-1 rounded-full shadow">
              -{product.discount}%
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-[#07222d]/35 flex items-center justify-center">
              <span className="bg-[#07222d] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Rupture de stock
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="text-[13px] text-[#4a6670] font-medium">
            {catObj ? (catObj[lang] || catObj.fr) : product.cat}
          </div>
          <div className="font-display text-[17px] font-bold leading-snug text-[#07222d]">{product.name}</div>
          <p className="text-[13px] text-[#4a6670] leading-snug line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#4a6670]">
            <span className="text-[#e3a93b] tracking-wider">{stars(product.rating)}</span>
            {product.rating} ({product.reviews} {t('reviews_word')})
          </div>
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            <span className="font-display text-[26px] font-extrabold text-[#07222d]">{product.price} د.ت</span>
            <span className="text-sm text-[#5b7480] line-through">{product.old} د.ت</span>
          </div>

          <label className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border cursor-pointer select-none transition ${
            isComparing
              ? 'bg-[#15677f] text-white border-[#15677f]'
              : compareDisabled
              ? 'text-ink/30 border-[#d6e3e6] cursor-not-allowed'
              : 'text-[#33505b] border-[#d6e3e6] hover:border-[#15677f]'
          }`}>
            <input
              type="checkbox"
              checked={isComparing}
              disabled={compareDisabled}
              onChange={() => toggleCompare(product.id)}
              className="w-3.5 h-3.5 accent-[#15677f]"
            />
            ⚖️ {isComparing ? 'Ajouté à comparer' : 'Ajouter à comparer'}
          </label>

          <div className="flex gap-2 mt-1">
            <button
              onClick={openDetail}
              className="flex-1 py-2.5 border-[1.5px] border-[#d6e3e6] text-[#07222d] text-sm font-semibold rounded-[10px] hover:border-[#15677f] transition"
            >
              {voirLabel[lang] || voirLabel.fr}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-[1.4] py-2.5 bg-[#15677f] text-white text-sm font-semibold rounded-[10px] hover:bg-[#0c3a4a] transition disabled:bg-[#e3eaec] disabled:text-[#5b7480] disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Indisponible' : t('add_to_cart')}
            </button>
          </div>
        </div>
      </div>

      {showDetail && createPortal(
        <div
          className="fixed inset-0 bg-[#07222d]/70 z-[260] flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div ref={ripplesRef} className="absolute inset-0 pointer-events-none" />

          <div
            className="relative bg-white rounded-3xl overflow-hidden w-[92vw] h-[88vh] max-w-6xl flex flex-col sm:flex-row shadow-2xl"
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
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-lg z-10 text-[#07222d] hover:bg-[#edf4f5] transition"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div
              className="relative sm:w-1/2 h-64 sm:h-full flex-shrink-0 bg-gradient-to-b from-[#e3f1f4] to-[#cfe6ec] cursor-zoom-in group"
              onClick={() => setShowLightbox(true)}
            >
              <img src={photoSrc} alt={product.name} className={`w-full h-full object-cover ${outOfStock ? 'grayscale' : ''}`} />
              {!outOfStock && (
                <span className="absolute top-4 left-4 bg-[#d9483b] text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  -{product.discount}%
                </span>
              )}
              <div className="absolute inset-0 bg-[#07222d]/0 group-hover:bg-[#07222d]/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-2xl">🔍</span>
              </div>
              <span className="absolute bottom-4 left-4 bg-white/95 text-[#07222d] text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                Cliquez pour agrandir
              </span>
            </div>

            <div className="flex-1 min-h-0 p-6 sm:p-9 overflow-y-auto">
              <div className="text-sm text-[#15677f] font-semibold mb-2">
                {catObj ? (catObj[lang] || catObj.fr) : product.cat}
              </div>
              <h3 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-[#07222d] mb-3 pr-10">{product.name}</h3>

              <div className="flex items-center gap-1.5 text-sm text-[#4a6670] mb-5">
                <span className="text-[#e3a93b] tracking-wider">{stars(product.rating)}</span>
                {product.rating} ({product.reviews} {t('reviews_word')})
              </div>

              {outOfStock && (
                <div className="bg-[#07222d] text-white text-sm font-semibold px-3 py-2 rounded-lg mb-4 inline-block">
                  ⚠️ Rupture de stock — disponible bientôt
                </div>
              )}

              <p className="text-[15px] text-[#33505b] mb-5 leading-relaxed">{product.description}</p>

              {product.specs && product.specs.length > 0 && (
                <ul className="mb-6 rounded-xl border border-[#d6e3e6] divide-y divide-[#d6e3e6] overflow-hidden">
                  {product.specs.map((s, i) => (
                    <li key={i} className="text-sm flex gap-3 px-4 py-2.5 odd:bg-[#f6fafb]">
                      <span className="font-semibold text-[#0c3a4a] w-2/5 flex-shrink-0">{s.label}</span>
                      <span className="text-[#33505b]">{s.value}</span>
                    </li>
                  ))}
                </ul>
              )}

              <ul className="mb-6 space-y-2 text-sm text-[#33505b]">
                <li className="flex items-center gap-2"><span className="text-[#2c9a6a] font-bold">✓</span>Livraison dans toute la Tunisie</li>
                <li className="flex items-center gap-2"><span className="text-[#2c9a6a] font-bold">✓</span>Paiement à la livraison</li>
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center border-[1.5px] border-[#d6e3e6] rounded-xl">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={outOfStock}
                    className="w-11 h-11 text-xl font-semibold text-[#07222d] hover:text-[#15677f] transition disabled:opacity-40"
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="text-base font-semibold min-w-[32px] text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    disabled={outOfStock}
                    className="w-11 h-11 text-xl font-semibold text-[#07222d] hover:text-[#15677f] transition disabled:opacity-40"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-base text-[#5b7480] line-through">{product.old * qty} د.ت</span>
                  <span className="font-display text-4xl font-extrabold text-[#07222d]">{product.price * qty} د.ت</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="w-full py-4 bg-[#15677f] text-white text-base font-semibold rounded-xl hover:bg-[#0c3a4a] transition disabled:bg-[#e3eaec] disabled:text-[#5b7480] disabled:cursor-not-allowed"
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
