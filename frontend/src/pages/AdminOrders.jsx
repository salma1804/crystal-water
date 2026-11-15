import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Icon, useAdminStats, timeAgo } from '../components/AdminShell.jsx';

export default function AdminOrders() {
  const { token } = useAdmin();
  const { refresh } = useAdminStats();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setError('Impossible de charger les commandes. Vérifiez votre connexion et réessayez.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const toggleDelivered = async (order) => {
    const newValue = !order.delivered;
    setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, delivered: newValue } : o)));
    try {
      const res = await fetch(`/api/orders/${order.id}/delivered`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ delivered: newValue }),
      });
      if (!res.ok) throw new Error();
      refresh();
    } catch {
      setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, delivered: !newValue } : o)));
      alert("Le statut n'a pas pu être mis à jour. Réessayez.");
    }
  };

  const pendingCount = orders.filter((o) => !o.delivered).length;
  const doneCount = orders.length - pendingCount;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => (tab === 'pending' ? !o.delivered : o.delivered))
      .filter((o) => !q || `${o.customer_name} ${o.phone} ${o.city || ''} ${o.address || ''}`.toLowerCase().includes(q));
  }, [orders, tab, query]);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Commandes</h1>
          <p className="adm-sub">Paiement à la livraison. Marquez une commande comme livrée une fois remise au client.</p>
        </div>
        <button className="adm-btn adm-btn--ghost" onClick={load}><Icon name="refresh" size={16} /> Actualiser</button>
      </div>

      <div className="adm-toolbar">
        <div className="adm-seg" role="tablist">
          <button className={tab === 'pending' ? 'on' : ''} onClick={() => setTab('pending')}>À livrer <em>{pendingCount}</em></button>
          <button className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>Livrées <em>{doneCount}</em></button>
        </div>
        <div className="adm-searchbox">
          <Icon name="search" size={16} />
          <input className="adm-input" placeholder="Nom, téléphone ou ville" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {loading && <p className="adm-loading">Chargement des commandes…</p>}
      {error && <div className="adm-error" role="alert"><Icon name="alert" size={18} /> <span>{error}</span></div>}

      {!loading && !error && shown.length === 0 && (
        <div className="adm-empty">
          <b>{query ? 'Aucun résultat' : tab === 'pending' ? 'Aucune commande à livrer' : 'Aucune commande livrée'}</b>
          {query ? 'Essayez un autre nom, numéro ou ville.' : tab === 'pending' ? 'Les nouvelles commandes du site apparaîtront ici.' : 'Les commandes marquées comme livrées seront listées ici.'}
        </div>
      )}

      <div className="adm-orders">
        {shown.map((o) => {
          const hasLocation = o.latitude != null && o.longitude != null;
          return (
            <article key={o.id} className={`adm-order ${o.delivered ? 'done' : ''}`}>
              <div className="adm-order__rail" />
              <div className="adm-order__body">
                <div className="adm-order__top">
                  <div>
                    <span className="adm-order__name">{o.customer_name}</span>
                    <a className="adm-order__tel" href={`tel:${o.phone}`}>{o.phone}</a>
                  </div>
                  <span className="adm-order__time" title={new Date(o.created_at).toLocaleString('fr-FR')}>{timeAgo(o.created_at)}</span>
                </div>
                <p className="adm-order__addr">
                  <Icon name="pin" size={16} />
                  <span>{o.address}{o.city ? `, ${o.city}` : ''}</span>
                </p>
                {hasLocation && (
                  <div className="adm-loc">
                    <Icon name="pin" size={14} />
                    {o.location_label || `${Number(o.latitude).toFixed(5)}, ${Number(o.longitude).toFixed(5)}`}
                  </div>
                )}

                <ul className="adm-items">
                  {(o.items || []).map((item, i) => (
                    <li key={i}>
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} onClick={() => setLightbox({ src: item.photo, alt: item.name })} />
                      ) : <span className="ph" />}
                      <span className="n">{item.name}</span>
                      <span className="adm-num">{item.price} د.ت</span>
                    </li>
                  ))}
                </ul>

                <div className="adm-order__foot">
                  <div className="adm-total"><small>Total</small>{o.total} د.ت</div>
                  {o.delivered ? (
                    <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => toggleDelivered(o)}>Remettre à livrer</button>
                  ) : (
                    <button className="adm-btn adm-btn--ok" onClick={() => toggleDelivered(o)}><Icon name="check" size={16} /> Marquer comme livrée</button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {lightbox && (
        <div className="adm-lightbox" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} aria-label="Fermer"><Icon name="close" size={18} /></button>
          <img src={lightbox.src} alt={lightbox.alt} onClick={(e) => e.stopPropagation()} />
          <p>{lightbox.alt}</p>
        </div>
      )}
    </>
  );
}
