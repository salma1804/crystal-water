import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';

const STORAGE_KEY = 'crystalwater_diagnostic_history';
const HINT_INTERVAL_MS = 5 * 60 * 1000;
const HINT_VISIBLE_MS = 7000;

export default function AIDiagnosticChat() {
  const navigate = useNavigate();
  const products = useProducts();
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [addedId, setAddedId] = useState(null);

  const [pos, setPos] = useState(() => {
    try {
      const saved = sessionStorage.getItem('crystalwater_diagnostic_position');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const dragInfo = useRef({ dragging: false, moved: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const btnRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const hideTimeout = setTimeout(() => setShowHint(false), HINT_VISIBLE_MS);
    const interval = setInterval(() => {
      setShowHint(true);
      setTimeout(() => setShowHint(false), HINT_VISIBLE_MS);
    }, HINT_INTERVAL_MS);
    return () => {
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [open, history, loading]);

  const compactCatalog = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name, cat: p.cat })),
    [products]
  );

  const clampPosition = (x, y) => {
    const size = 56;
    const maxX = window.innerWidth - size - 8;
    const maxY = window.innerHeight - size - 8;
    return { x: Math.min(Math.max(8, x), maxX), y: Math.min(Math.max(8, y), maxY) };
  };

  const startDrag = (clientX, clientY) => {
    const rect = btnRef.current.getBoundingClientRect();
    dragInfo.current = {
      dragging: true,
      moved: false,
      startX: clientX,
      startY: clientY,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragInfo.current.dragging) return;
    const dx = Math.abs(clientX - dragInfo.current.startX);
    const dy = Math.abs(clientY - dragInfo.current.startY);
    if (dx > 4 || dy > 4) dragInfo.current.moved = true;

    const next = clampPosition(clientX - dragInfo.current.offsetX, clientY - dragInfo.current.offsetY);
    setPos(next);
  };

  const endDrag = () => {
    if (!dragInfo.current.dragging) return;
    dragInfo.current.dragging = false;
    if (pos) sessionStorage.setItem('crystalwater_diagnostic_position', JSON.stringify(pos));
  };

  useEffect(() => {
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e) => {
      if (e.touches[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  const handleButtonClick = () => {
    if (!dragInfo.current.moved) {
      setOpen((o) => !o);
      setShowHint(false);
    }
    dragInfo.current.moved = false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim().length < 5) {
      setError('Décrivez votre problème en quelques mots.');
      return;
    }
    const problem = input.trim();
    setError('');
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, catalog: compactCatalog }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Le diagnostic n'a pas pu être généré, réessayez.");
      } else {
        setHistory((h) => [...h, { problem, result: data }]);
      }
    } catch (err) {
      setError('Impossible de contacter le serveur, réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const goToProduct = (id, cat) => {
    setOpen(false);
    navigate(`/categorie/${cat}?openProduct=${id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const panelStyle = pos
    ? { left: Math.min(pos.x, window.innerWidth - 400), top: Math.max(pos.y - 570, 12) }
    : { left: 24, bottom: 96 };

  return (
    <>
      <div
        className="fixed z-[150] flex items-end gap-3"
        style={pos ? { left: pos.x, top: pos.y } : { left: 24, bottom: 24 }}
      >
        <div className="relative w-[68px] h-[68px] flex-shrink-0">
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#2bb7d6] opacity-50 animate-ping motion-reduce:animate-none pointer-events-none"
            style={{ animationDuration: '2.4s' }}
          />
        )}
        <button
          ref={btnRef}
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onTouchStart={(e) => e.touches[0] && startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onClick={handleButtonClick}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2bb7d6] to-[#15677f] shadow-[0_18px_34px_-14px_rgba(21,103,127,.8)] flex items-center justify-center hover:scale-105 transition cursor-grab active:cursor-grabbing touch-none select-none"
          aria-label="Assistant eau (glisser pour déplacer)"
        >
          {showHint && !open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e3a93b] rounded-full animate-ping" />
          )}
          <svg viewBox="0 0 24 24" width="30" height="30" fill="white" draggable="false">
            <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" />
          </svg>
        </button>
        </div>

        {showHint && !open && (
          <div className="relative bg-white border border-[#d6e3e6] rounded-2xl rounded-bl-sm shadow-[0_14px_30px_-18px_rgba(7,34,45,.5)] px-4 py-3 text-sm font-medium text-[#07222d] max-w-[230px] animate-chat-pop">
            💬 Un problème d'eau ? Contactez-nous, notre assistant peut vous aider !
            <button
              onClick={() => setShowHint(false)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink/10 text-ink/60 text-xs flex items-center justify-center hover:bg-ink/20"
              aria-label="Fermer l'indication"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed z-[151] w-[380px] max-w-[92vw] h-[560px] max-h-[80vh] bg-white border border-[#d6e3e6] rounded-[26px] shadow-[0_40px_80px_-40px_rgba(7,34,45,.6)] overflow-hidden flex flex-col animate-chat-pop"
          style={panelStyle}
        >
          <div className="bg-gradient-to-br from-[#07222d] to-[#0c3a4a] text-white px-4 py-4 flex items-center gap-3 flex-shrink-0">
            <span className="relative w-11 h-11 rounded-full bg-[#15677f] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
                <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" />
              </svg>
              <span className="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-[#3fcf8e] border-2 border-[#0c3a4a]" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[17px] leading-tight">Assistant Eau Crystal</div>
              <div className="text-[13px] text-[#9fc4cf]">Répond en quelques secondes</div>
            </div>
            <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition" aria-label="Fermer">
              ✕
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f6fafb]">
            {history.length === 0 && !loading && (
              <div className="bg-white border border-[#d6e3e6] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm text-ink/80">
                👋 Bonjour ! Décrivez-moi votre problème d'eau (calcaire, goût, odeur, débit...) et je vous recommande les produits adaptés.
              </div>
            )}

            {history.map((entry, idx) => (
              <div key={idx} className="space-y-3">
                <div className="ml-auto bg-[#15677f] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm w-fit">
                  {entry.problem}
                </div>

                <div className="water-fill-in">
                  <div className="bg-white border border-[#d6e3e6] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm text-ink/80 mb-3">
                    {entry.result.summary}
                  </div>

                  {entry.result.recommendations.length === 0 ? (
                    <p className="text-xs text-ink/50 px-1">
                      Aucun produit ne correspond précisément — contactez-nous pour un conseil personnalisé.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {entry.result.recommendations.map((rec, i) => {
                        const p = products.find((prod) => String(prod.id) === String(rec.id));
                        if (!p) return null;
                        const photoSrc = p.hasRealPhoto
                          ? imgUrl(p.image)
                          : categoryIcons[p.cat] || '/product-images/placeholder.svg';
                        return (
                          <div
                            key={rec.id}
                            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                            className="water-fill-in-item bg-white border border-[#d6e3e6] rounded-2xl p-3 hover:border-[#15677f] hover:shadow-md transition"
                          >
                            <button
                              onClick={() => goToProduct(p.id, p.cat)}
                              className="w-full flex gap-2.5 text-left"
                            >
                              <img src={photoSrc} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-aqua flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold leading-tight mb-0.5 truncate">{p.name}</div>
                                <div className="text-[11px] text-ink/55 leading-snug line-clamp-2 mb-1">{rec.reason}</div>
                                <div className="font-display text-sm font-extrabold text-[#15677f]">{p.price} د.ت</div>
                              </div>
                            </button>
                            <button
                              onClick={(e) => handleAddToCart(e, p)}
                              className={`w-full mt-2 py-2.5 rounded-xl text-[13px] font-semibold transition ${
                                addedId === p.id
                                  ? 'bg-[#15677f]/10 text-[#15677f]'
                                  : 'bg-[#15677f] text-white hover:bg-[#0c3a4a]'
                              }`}
                            >
                              {addedId === p.id ? '✓ Ajouté au panier' : '+ Ajouter au panier'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <>
                <div className="ml-auto bg-[#15677f] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm w-fit opacity-70">
                  ...
                </div>
                <div className="bg-white border border-[#d6e3e6] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[60%] flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" />
                </div>
              </>
            )}

            {error && (
              <div className="bg-[#fdecea] text-[#a8321f] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-[#d6e3e6] bg-white p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={history.length === 0 ? 'Décrivez votre problème...' : 'Une autre question ?'}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-full border-[1.5px] border-[#d6e3e6] text-sm placeholder:text-[#8aa0a8] focus:outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-11 h-11 rounded-full bg-[#15677f] text-white flex items-center justify-center hover:bg-[#0c3a4a] transition disabled:opacity-50 flex-shrink-0"
              aria-label="Envoyer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}