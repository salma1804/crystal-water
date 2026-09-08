
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> @'
>> // backend/routes/orders.js
>> import express from 'express';
>> import { pool } from '../lib/db.js';
>> import { requireAdmin } from './auth.js';
>>
>> const router = express.Router();
>>
>> async function sendEmail(to, subject, html) {
>>   const apiKey = process.env.RESEND_API_KEY;
>>   if (!apiKey || !to) return;
>>
>>   try {
>>     const res = await fetch('https://api.resend.com/emails', {
>>       method: 'POST',
>>       headers: {
>>         Authorization: `Bearer ${apiKey}`,
>>         'Content-Type': 'application/json',
>>       },
>>       body: JSON.stringify({
>>         from: 'Crystal Water <onboarding@resend.dev>',
>>         to,
>>         subject,
>>         html,
>>       }),
>>     });
>>     if (!res.ok) {
>>       const errText = await res.text();
>>       console.error('Envoi email échoué :', res.status, errText);
>>     }
>>   } catch (err) {
>>     console.error('Envoi email échoué :', err.message);
>>   }
>> }
>>
>> async function notifyAdminWhatsApp(order) {
>>   const phone = process.env.CALLMEBOT_PHONE;
>>   const apikey = process.env.CALLMEBOT_APIKEY;
>>   if (!phone || !apikey) return;
>>
>>   const itemsList = (order.items || []).map((i) => `- ${i.name}`).join('\n');
>>   const message =
>>     `🔔 Nouvelle commande !\n` +
>>     `${order.customer_name} — ${order.phone}\n` +
>>     `${order.address}${order.city ? ', ' + order.city : ''}\n` +
>>     `${itemsList}\n` +
>>     `Total : ${order.total} د.ت`;
>>
>>   const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apikey}`;
>>
>>   try {
>>     await fetch(url);
>>   } catch (err) {
>>     console.error('Notification WhatsApp admin échouée :', err.message);
>>   }
>> }
>>
>> function notifyAdminEmail(order) {
>>   const adminEmail = process.env.ADMIN_EMAIL;
>>   if (!adminEmail) return;
>>
>>   const itemsHtml = (order.items || [])
>>     .map((i) => `<li>${i.name} — ${i.price} د.ت</li>`)
>>     .join('');
>>
>>   const html = `
>>     <h2>🔔 Nouvelle commande — Crystal Water</h2>
>>     <p><b>${order.customer_name}</b> — ${order.phone}</p>
>>     <p>${order.address}${order.city ? ', ' + order.city : ''}</p>
>>     <ul>${itemsHtml}</ul>
>>     <p><b>Total : ${order.total} د.ت</b></p>
>>   `;
>>
>>   sendEmail(adminEmail, `Nouvelle commande — ${order.customer_name} (${order.total} د.ت)`, html);
>> }
>>
>> function sendCustomerConfirmationEmail(order) {
>>   if (!order.customer_email) return;
>>
>>   const itemsHtml = (order.items || [])
>>     .map((i) => `<li>${i.name} — ${i.price} د.ت</li>`)
>>     .join('');
>>
>>   const html = `
>>     <h2>✅ Merci pour votre commande, ${order.customer_name} !</h2>
>>     <p>Votre commande a bien été enregistrée. Voici un récapitulatif :</p>
>>     <ul>${itemsHtml}</ul>
>>     <p><b>Total : ${order.total} د.ت</b></p>
>>     <p>Paiement à la livraison. Nous vous appelons bientôt pour confirmer.</p>
>>   `;
>>
>>   sendEmail(order.customer_email, `Votre commande Crystal Water — ${order.total} د.ت`, html);
>> }
>>
>> router.post('/', async (req, res) => {
>>   const { customer_name, phone, address, city, items, total, email, latitude, longitude, location_label } = req.body;
>>
>>   if (!customer_name || !phone || !address || !items || items.length === 0) {
>>     return res.status(400).json({ error: 'Champs obligatoires manquants (nom, téléphone, adresse, produits).' });
>>   }
>>
>>   if (!pool) {
>>     console.log('Commande reçue (mode démo) :', req.body);
>>     return res.status(200).json({ ok: true, demo: true });
>>   }
>>
>>   try {
>>     const result = await pool.query(
>>       `insert into orders (customer_name, phone, address, city, items, total, customer_email, latitude, longitude, location_label)
>>        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
>>        returning *`,
>>       [customer_name, phone, address, city, JSON.stringify(items), total, email || null, latitude ?? null, longitude ?? null, location_label || null]
>>     );
>>
>>     const order = result.rows[0];
>>
>>     notifyAdminWhatsApp(order);
>>     notifyAdminEmail(order);
>>     sendCustomerConfirmationEmail(order);
>>
>>     res.status(201).json({ ok: true, order });
>>   } catch (err) {
>>     console.error(err);
>>     res.status(500).json({ error: "Impossible d'enregistrer la commande." });
>>   }
>> });
>>
>> router.get('/', requireAdmin, async (req, res) => {
>>   if (!pool) return res.status(200).json({ orders: [] });
>>
>>   try {
>>     const result = await pool.query('select * from orders order by created_at desc');
>>     res.json({ orders: result.rows });
>>   } catch (err) {
>>     res.status(500).json({ error: err.message });
>>   }
>> });
>>
>> router.patch('/:id/delivered', requireAdmin, async (req, res) => {
>>   const { delivered } = req.body;
>>
>>   if (!pool) return res.status(200).json({ ok: true, demo: true });
>>
>>   try {
>>     const result = await pool.query(
>>       'update orders set delivered = $1 where id = $2 returning *',
>>       [delivered !== false, req.params.id]
>>     );
>>     if (result.rows.length === 0) return res.status(404).json({ error: 'Commande introuvable.' });
>>     res.json({ ok: true, order: result.rows[0] });
>>   } catch (err) {
>>     console.error(err);
>>     res.status(500).json({ error: "Impossible de mettre à jour la commande." });
>>   }
>> });
>>
>> export default router;
>> '@ | Out-File -FilePath backend\routes\orders.js -Encoding utf8
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> Get-Content backend\routes\orders.js | Select-String "order_code"
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> git add backend/routes/orders.js
warning: in the working copy of 'backend/routes/orders.js', LF will be replaced by CRLF the next time Git touches it
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> git commit -m "Corrige orders.js - retire order_code obsolète"
[main 88eedf6] Corrige orders.js - retire order_code obsolète
 1 file changed, 10 insertions(+), 112 deletions(-)
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> git push
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 20 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 580 bytes | 580.00 KiB/s, done.
Total 5 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
To https://github.com/salma1804/crystal-water.git
   26d8200..88eedf6  main -> main
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> cd "C:\Users\User\Downloads\crystal-water (3)\crystal-water"

PS C:\Users\User\Downloads\crystal-water (3)\crystal-water>
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> (Get-Content frontend\src\pages\CategoryPage.jsx) -replace 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6', 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6' | Set-Content frontend\src\pages\CategoryPage.jsx
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> Select-String -Path frontend\src\pages\CategoryPage.jsx -Pattern "grid-cols"

frontend\src\pages\CategoryPage.jsx:237:            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4
gap-3 sm:gap-6">
frontend\src\pages\CategoryPage.jsx:270:                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
gap-5">
frontend\src\pages\CategoryPage.jsx:309:                  <div className="grid grid-cols-2 sm:grid-cols-2
lg:grid-cols-4 gap-3 sm:gap-6">
frontend\src\pages\CategoryPage.jsx:328:                  <div className="grid grid-cols-2 sm:grid-cols-2
lg:grid-cols-4 gap-3 sm:gap-6">


PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> git add frontend/src/pages/CategoryPage.jsx
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> git commit -m "Corrige l'affichage mobile - 2 produits par ligne minimum"
[main e5a3d7d] Corrige l'affichage mobile - 2 produits par ligne minimum
 1 file changed, 4 insertions(+), 4 deletions(-)
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> git push
Enumerating objects: 11, done.
Counting objects: 100% (11/11), done.
Delta compression using up to 20 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (6/6), 563 bytes | 563.00 KiB/s, done.
Total 6 (delta 5), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (5/5), completed with 5 local objects.
To https://github.com/salma1804/crystal-water.git
   88eedf6..e5a3d7d  main -> main
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> Get-Content frontend\src\components\AIDiagnosticChat.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';

const STORAGE_KEY = 'crystalwater_diagnostic_history';
const HINT_INTERVAL_MS = 5 * 60 * 1000;
const HINT_VISIBLE_MS = 7000;

export default function AIDiagnosticChat() {
  const navigate = useNavigate();
  const products = useProducts();
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
      setError('DÃ©crivez votre problÃ¨me en quelques mots.');
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
        setError(data.error || "Le diagnostic n'a pas pu Ãªtre gÃ©nÃ©rÃ©, rÃ©essayez.");
      } else {
        setHistory((h) => [...h, { problem, result: data }]);
      }
    } catch (err) {
      setError('Impossible de contacter le serveur, rÃ©essayez.');
    } finally {
      setLoading(false);
    }
  };

  const goToProduct = (id, cat) => {
    setOpen(false);
    navigate(`/categorie/${cat}?openProduct=${id}`);
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
        <button
          ref={btnRef}
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onTouchStart={(e) => e.touches[0] && startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onClick={handleButtonClick}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
          className="w-14 h-14 rounded-full bg-teal shadow-lg flex items-center justify-center hover:scale-105 transition flex-shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          aria-label="Assistant eau (glisser pour dÃ©placer)"
        >
          {showHint && !open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full animate-ping" />
          )}
          <svg viewBox="0 0 24 24" width="26" height="26" fill="white" draggable="false">
            <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" />
          </svg>
        </button>

        {showHint && !open && (
          <div className="relative bg-white rounded-2xl rounded-bl-sm shadow-lg px-4 py-2.5 text-sm text-ink max-w-[210px] animate-chat-pop">
            ðŸ’¬ Un problÃ¨me d'eau ? Contactez-nous, notre assistant peut vous aider !
            <button
              onClick={() => setShowHint(false)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink/10 text-ink/60 text-xs flex items-center justify-center hover:bg-ink/20"
              aria-label="Fermer l'indication"
            >
              âœ•
            </button>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed z-[151] w-[380px] max-w-[90vw] h-[560px] max-h-[75vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-chat-pop"
          style={panelStyle}
        >
          <div className="bg-teal text-white px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" />
              </svg>
              <span className="text-sm font-semibold">Assistant Eau Crystal</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg leading-none">
              âœ•
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 && !loading && (
              <div className="bg-mineral2 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm text-ink/80">
                ðŸ‘‹ Bonjour ! DÃ©crivez-moi votre problÃ¨me d'eau (calcaire, goÃ»t, odeur, dÃ©bit...) et je vous recommande les produits adaptÃ©s.
              </div>
            )}

            {history.map((entry, idx) => (
              <div key={idx} className="space-y-3">
                <div className="ml-auto bg-teal text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm w-fit">
                  {entry.problem}
                </div>

                <div className="water-fill-in">
                  <div className="bg-mineral2 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm text-ink/80 mb-3">
                    {entry.result.summary}
                  </div>

                  {entry.result.recommendations.length === 0 ? (
                    <p className="text-xs text-ink/50 px-1">
                      Aucun produit ne correspond prÃ©cisÃ©ment â€” contactez-nous pour un conseil personnalisÃ©.
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
                          <button
                            key={rec.id}
                            onClick={() => goToProduct(p.id, p.cat)}
                            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                            className="water-fill-in-item w-full flex gap-2.5 bg-white border border-ink/10 rounded-xl p-2.5 text-left hover:border-teal hover:shadow-md transition"
                          >
                            <img src={photoSrc} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-aqua flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold leading-tight mb-0.5 truncate">{p.name}</div>
                              <div className="text-[11px] text-ink/55 leading-snug line-clamp-2 mb-1">{rec.reason}</div>
                              <div className="font-mono text-xs font-semibold text-tealDeep">{p.price} Ø¯.Øª</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <>
                <div className="ml-auto bg-teal text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm w-fit opacity-70">
                  ...
                </div>
                <div className="bg-mineral2 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[60%] flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-500 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-ink/10 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={history.length === 0 ? 'DÃ©crivez votre problÃ¨me...' : 'Une autre question ?'}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-full border border-ink/15 text-sm focus:outline-none focus:border-teal transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center hover:bg-tealLight transition disabled:opacity-50 flex-shrink-0"
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
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> Get-Content frontend\src\context\LangContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key) => (translations[lang] && translations[lang][key]) || translations.fr[key] || key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water> Get-Content frontend\src\context\ProductsContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { products as staticProducts } from '../data/products.js';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [overrides, setOverrides] = useState([]);
  const [customProducts, setCustomProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOverrides = async () => {
    try {
      const res = await fetch('/api/products/overrides');
      const data = await res.json();
      setOverrides(data.overrides || []);
      setCustomProducts(data.custom || []);
    } catch (err) {
      console.error('Impossible de charger les modifications admin, catalogue de base utilisÃ©.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverrides();
  }, []);

  const products = useMemo(() => {
    const overrideMap = new Map(overrides.map((o) => [String(o.product_id), o]));

    const merged = staticProducts.map((p) => {
      const o = overrideMap.get(String(p.id));
      if (!o) return { ...p, inStock: true };
      return {
        ...p,
        price: o.price != null ? Number(o.price) : p.price,
        old: o.old_price != null ? Number(o.old_price) : p.old,
        discount: o.discount != null ? o.discount : p.discount,
        inStock: o.in_stock !== false,
      };
    });

    const customMapped = customProducts.map((c) => ({
      id: `custom-${c.id}`,
      name: c.name,
      cat: c.cat,
      subcat: c.subcat || undefined,
      description: c.description || '',
      image: c.image || '',
      hasRealPhoto: c.has_real_photo || false,
      price: Number(c.price),
      old: Number(c.old_price || c.price),
      discount: c.discount || 0,
      rating: Number(c.rating || 0),
      reviews: c.reviews || 0,
      specs: c.specs || [],
      inStock: c.in_stock !== false,
      isCustom: true,
    }));

    return [...merged, ...customMapped];
  }, [overrides, customProducts]);

  return (
    <ProductsContext.Provider value={{ products, loading, refresh: loadOverrides }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts doit Ãªtre utilisÃ© Ã  l'intÃ©rieur de <ProductsProvider>");
  return ctx.products;
}

export function useProductsAdmin() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProductsAdmin doit Ãªtre utilisÃ© Ã  l'intÃ©rieur de <ProductsProvider>");
  return ctx;
}
PS C:\Users\User\Downloads\crystal-water (3)\crystal-water>