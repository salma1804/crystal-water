import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useProductsAdmin } from '../context/ProductsContext.jsx';
import '../admin.css';

/* ---------- Icônes ---------- */
const PATHS = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  orders: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
  box: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 21h4',
  star: 'm12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5z',
  mail: 'M3.5 6h17v12h-17V6zm0 0L12 13l8.5-7',
  out: 'M15 4h4.5v16H15M10 8l-4 4 4 4M6 12h10',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  arrow: 'M9 5l7 7-7 7',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12 4 4',
  pin: 'M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10C5.5 15.4 12 21 12 21zM12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z',
  eyeoff: 'M3 3l18 18M10.6 5.7A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.5 7.3A15.6 15.6 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.3 3.8-.8M9.9 9.9a2.8 2.8 0 0 0 4.2 3.7',
  shield: 'M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6L12 3zM9 12l2.2 2.2L15.5 10',
  alert: 'M12 4 2.8 19.5h18.4L12 4zM12 10v4.5M12 17v.2',
  plus: 'M12 5v14M5 12h14',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
};
export function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------- Vagues ---------- */
const WAVE = 'M0 30 C100 0 200 0 300 30 S500 60 600 30 S800 0 900 30 S1100 60 1200 30 V80 H0 Z';
export function Waves({ colors = ['#2bb7d6', '#15677f', '#0c3a4a'] }) {
  return (
    <div className="adm-waves" aria-hidden="true">
      {colors.map((c, i) => (
        <div key={i} className={`adm-wave adm-wave--${i + 1}`}>
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none"><path d={WAVE} fill={c} /></svg>
        </div>
      ))}
    </div>
  );
}

/* ---------- Utilitaires ---------- */
export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return new Date(date).toLocaleDateString('fr-FR');
}

/* ---------- Compteurs partagés ---------- */
const StatsContext = createContext({ loading: true, orders: [], refresh: () => {} });
export const useAdminStats = () => useContext(StatsContext);

/* ---------- Coquille ---------- */
export default function AdminShell({ token, onLogout, children }) {
  const { products } = useProductsAdmin();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({ loading: true, orders: [], reminders: null, messages: null, reviews: null });
  const [intro] = useState(() => {
    try {
      if (sessionStorage.getItem('cw_admin_intro')) return false;
      sessionStorage.setItem('cw_admin_intro', '1');
      return true;
    } catch { return false; }
  });
  const [introDone, setIntroDone] = useState(false);

  const refresh = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const get = (url) => fetch(url, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const [o, r, m, v] = await Promise.all([
      get('/api/orders'), get('/api/reminders/due'), get('/api/contact'), get('/api/reviews/all'),
    ]);
    setStats({
      loading: false,
      orders: o?.orders || [],
      reminders: r ? (r.reminders || []).length : null,
      messages: m ? (m.messages || []).filter((x) => !x.read).length : null,
      reviews: v ? (v.reviews || []).filter((x) => !x.approved).length : null,
    });
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Administration — Crystal Water';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.title = prevTitle;
      meta.remove();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const pendingOrders = stats.orders.filter((o) => !o.delivered).length;
  const outOfStock = products.filter((p) => p.inStock === false).length;

  const links = [
    { to: '/admin', label: 'Tableau de bord', icon: 'home', end: true },
    { to: '/admin/commandes', label: 'Commandes', icon: 'orders', count: pendingOrders },
    { to: '/admin/produits', label: 'Produits', icon: 'box', count: outOfStock, alert: true },
    { to: '/admin/rappels', label: 'Rappels', icon: 'bell', count: stats.reminders },
    { to: '/admin/avis', label: 'Avis clients', icon: 'star', count: stats.reviews },
    { to: '/admin/messages', label: 'Messages', icon: 'mail', count: stats.messages },
  ];

  return (
    <StatsContext.Provider value={{ ...stats, refresh, pendingOrders, outOfStock }}>
      <div className="adm-root">
        <header className="adm-topbar">
          <b>Crystal Water</b>
          <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Icon name="menu" /></button>
        </header>

        {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}

        <aside className={`adm-side ${open ? 'open' : ''}`}>
          <Waves colors={['#2bb7d6', '#15677f', '#0c3a4a']} />
          <div className="adm-side__brand">
            <img src="/favicon.png" alt="" />
            <div><b>Crystal Water</b><small>Espace de gestion</small></div>
          </div>
          <nav className="adm-nav" onClick={() => setOpen(false)}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon name={l.icon} />
                {l.label}
                {l.count > 0 && <span className={`adm-count ${l.alert ? 'adm-count--alert' : ''}`}>{l.count}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="adm-side__foot">
            <a href="/" target="_blank" rel="noopener noreferrer"><Icon name="globe" /> Voir le site</a>
            <button onClick={onLogout}><Icon name="out" /> Se déconnecter</button>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-page">{children}</div>
        </main>

        {intro && !introDone && (
          <div className="adm-drain" onAnimationEnd={() => setIntroDone(true)} aria-hidden="true">
            <svg viewBox="0 0 1200 80" preserveAspectRatio="none"><path d={WAVE} fill="#07222d" /></svg>
          </div>
        )}
      </div>
    </StatsContext.Provider>
  );
}
