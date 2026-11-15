import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';

function groupCart(cart) {
  const groups = [];
  const map = new Map();
  for (const p of cart) {
    if (map.has(p.id)) {
      map.get(p.id).qty += 1;
    } else {
      const group = { ...p, qty: 1 };
      map.set(p.id, group);
      groups.push(group);
    }
  }
  return groups;
}

export default function CartDrawer() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { cart, total, isOpen, setIsOpen, addToCart, removeOneFromCart, removeAllOfProduct, clearCart } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const grouped = groupCart(cart);

  const requestClose = () => {
    setVisible(false);
    setTimeout(() => setIsOpen(false), 250);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Vider tout le panier ?')) clearCart();
  };

  const goToCheckout = () => {
    setIsOpen(false);
    navigate('/commande');
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-colors duration-300 ${
        visible ? 'bg-[#07222d]/70' : 'bg-[#07222d]/0'
      }`}
      onClick={requestClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-[#edf4f5] w-full max-w-3xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <div className="px-7 py-5 bg-[#07222d] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-[#15677f] flex items-center justify-center" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">{t('cart_title')}</h2>
              {cart.length > 0 && (
                <p className="text-[#9fc4cf] text-sm">
                  {cart.length} article{cart.length > 1 ? 's' : ''} dans votre panier
                </p>
              )}
            </div>
          </div>
          <button
            onClick={requestClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {grouped.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💧</div>
              <p className="font-display text-xl font-bold text-[#07222d] mb-1">{t('cart_empty')}</p>
              <p className="text-sm text-[#4a6670]">Découvrez nos produits et commencez votre commande.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {grouped.map((p) => {
                const photoSrc = p.hasRealPhoto
                  ? (p.isCustom ? p.image : imgUrl(p.image))
                  : (categoryIcons[p.cat] || '/product-images/placeholder.svg');

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-[#d6e3e6] p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-b from-[#e3f1f4] to-[#cfe6ec] overflow-hidden">
                      <img
                        src={photoSrc}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = '/product-images/placeholder.svg'; }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] leading-snug text-[#07222d] line-clamp-2 mb-2">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border-[1.5px] border-[#d6e3e6] rounded-lg">
                          <button
                            onClick={() => removeOneFromCart(p.id)}
                            className="w-8 h-8 flex items-center justify-center text-base font-semibold hover:text-[#15677f] transition"
                            aria-label="Diminuer la quantité"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold min-w-[22px] text-center">{p.qty}</span>
                          <button
                            onClick={() => addToCart(p)}
                            className="w-8 h-8 flex items-center justify-center text-base font-semibold hover:text-[#15677f] transition"
                            aria-label="Augmenter la quantité"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-[#4a6670]">{p.price} د.ت l'unité</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        onClick={() => removeAllOfProduct(p.id)}
                        className="w-8 h-8 rounded-full hover:bg-[#fdecea] flex items-center justify-center text-[#d9483b] transition"
                        title="Retirer du panier"
                        aria-label="Retirer du panier"
                      >
                        🗑
                      </button>
                      <span className="font-display text-xl font-extrabold text-[#07222d] whitespace-nowrap">
                        {p.price * p.qty} د.ت
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {grouped.length > 0 && (
          <div className="px-5 sm:px-7 py-5 bg-white border-t border-[#d6e3e6] flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-semibold text-[#33505b]">{t('cart_total')}</span>
              <span className="font-display text-3xl font-extrabold text-[#07222d]">{total} د.ت</span>
            </div>
            <p className="text-sm text-[#4a6670] mb-4">Vous payez à la livraison, rien à régler maintenant.</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="order-3 sm:order-1 flex-1 py-3 border-[1.5px] border-[#d6e3e6] text-[#07222d] text-sm font-semibold rounded-xl hover:border-[#15677f] transition"
              >
                Continuer mes achats
              </button>
              <button
                onClick={handleClearCart}
                className="order-2 flex-1 py-3 border-[1.5px] border-[#f2c4bf] text-[#d9483b] text-sm font-semibold rounded-xl hover:bg-[#fdecea] transition"
              >
                Vider le panier
              </button>
              <button
                onClick={goToCheckout}
                className="order-1 sm:order-3 flex-[1.6] py-3 bg-[#2bb7d6] text-[#07222d] text-base font-bold rounded-xl hover:bg-[#5fcbe3] transition"
              >
                Passer la commande →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
