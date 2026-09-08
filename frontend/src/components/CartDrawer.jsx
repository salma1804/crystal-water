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
        visible ? 'bg-ink/60' : 'bg-ink/0'
      }`}
      onClick={requestClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-mineral w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <div className="px-8 py-6 bg-gradient-to-r from-teal to-tealDeep text-white flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-display text-2xl font-bold">🛒 {t('cart_title')}</h2>
            {cart.length > 0 && (
              <p className="text-white/70 text-sm mt-0.5">
                {cart.length} article{cart.length > 1 ? 's' : ''} dans votre panier
              </p>
            )}
          </div>
          <button
            onClick={requestClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {grouped.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💧</div>
              <p className="text-lg font-semibold mb-1">{t('cart_empty')}</p>
              <p className="text-sm text-ink/50">Découvrez nos produits et commencez votre commande.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grouped.map((p) => {
                const photoSrc = p.hasRealPhoto
                  ? (p.isCustom ? p.image : imgUrl(p.image))
                  : (categoryIcons[p.cat] || '/product-images/placeholder.svg');

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl overflow-hidden border border-ink/10 hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative aspect-square bg-aqua overflow-hidden">
                      <img
                        src={photoSrc}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = '/product-images/placeholder.svg'; }}
                      />
                      <button
                        onClick={() => removeAllOfProduct(p.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center text-red-500 shadow transition"
                        title="Retirer du panier"
                      >
                        🗑
                      </button>
                      {p.qty > 1 && (
                        <span className="absolute top-2 left-2 bg-gold text-ink text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">
                          {p.qty}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-sm font-semibold leading-tight mb-2 line-clamp-2 min-h-[2.5em]">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-tealDeep">
                          {p.price * p.qty} د.ت
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => removeOneFromCart(p.id)}
                            className="w-7 h-7 rounded-full border border-ink/15 flex items-center justify-center text-sm font-semibold hover:border-teal hover:text-teal transition"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold min-w-[14px] text-center">{p.qty}</span>
                          <button
                            onClick={() => addToCart(p)}
                            className="w-7 h-7 rounded-full border border-ink/15 flex items-center justify-center text-sm font-semibold hover:border-teal hover:text-teal transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {grouped.length > 0 && (
          <div className="px-8 py-6 bg-white border-t border-ink/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-ink/70">{t('cart_total')}</span>
              <span className="font-mono text-3xl font-bold text-tealDeep">{total} د.ت</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="order-3 sm:order-1 flex-1 py-3 border border-ink/15 text-ink text-sm font-semibold rounded-lg hover:border-teal transition"
              >
                Continuer mes achats
              </button>
              <button
                onClick={handleClearCart}
                className="order-2 flex-1 py-3 border border-red-200 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-50 transition"
              >
                Vider le panier
              </button>
              <button
                onClick={goToCheckout}
                className="order-1 sm:order-3 flex-[1.5] py-3 bg-teal text-white text-sm font-bold rounded-lg hover:bg-tealLight transition shadow-lg shadow-teal/30"
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