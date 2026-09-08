import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';

export default function AdminOrders() {
  const { token } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setError('Impossible de charger les commandes.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const toggleDelivered = async (order) => {
    const newValue = !order.delivered;
    setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, delivered: newValue } : o)));
    try {
      await fetch(`/api/orders/${order.id}/delivered`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ delivered: newValue }),
      });
    } catch {
      setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, delivered: !newValue } : o)));
      alert("Impossible de mettre à jour le statut, réessayez.");
    }
  };

  const copyLocationLink = (order) => {
    const url = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const pending = orders.filter((o) => !o.delivered);
  const delivered = orders.filter((o) => o.delivered);

  const OrderCard = ({ o }) => {
    const hasLocation = o.latitude != null && o.longitude != null;
    const mapUrl = hasLocation ? `https://www.google.com/maps?q=${o.latitude},${o.longitude}` : null;

    return (
      <div className={`bg-white border rounded-lg p-4 ${o.delivered ? 'border-ink/5 opacity-60' : 'border-ink/10'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">{o.customer_name} — {o.phone}</div>
          <div className="text-xs text-ink/40">{new Date(o.created_at).toLocaleString('fr-FR')}</div>
        </div>
        <div className="text-xs text-ink/60 mb-2">{o.address}{o.city ? `, ${o.city}` : ''}</div>

        {hasLocation && (
          <div className="mb-2 bg-mineral2 rounded px-3 py-2">
            <p className="text-xs font-semibold text-teal">
              📍 {o.location_label || `${o.latitude.toFixed(5)}, ${o.longitude.toFixed(5)}`}
            </p>
          </div>
        )}

        <div className="space-y-1.5 mb-2">
          {(o.items || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-ink/70">
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.name}
                  onClick={() => setLightbox({ src: item.photo, alt: item.name })}
                  className="w-8 h-8 rounded object-cover bg-aqua flex-shrink-0 cursor-zoom-in hover:opacity-80 transition"
                />
              )}
              <span>{item.name} — {item.price} د.ت</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-tealDeep">Total : {o.total} د.ت</div>
          <button
            onClick={() => toggleDelivered(o)}
            className={`px-4 py-1.5 text-xs font-semibold rounded transition ${
              o.delivered
                ? 'border border-ink/15 text-ink/60 hover:border-teal'
                : 'bg-teal text-white hover:bg-tealLight'
            }`}
          >
            {o.delivered ? '↺ Annuler' : '✓ Marquer comme livrée'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">Commandes</h1>

      {loading && <p className="text-sm text-ink/50">Chargement...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-mineral2 rounded-lg p-8 text-center text-sm text-ink/50">
          Aucune commande pour l'instant.
        </div>
      )}

      {!loading && pending.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-ink/70 uppercase tracking-wide mb-3">
            À livrer ({pending.length})
          </h2>
          <div className="space-y-3 mb-8">
            {pending.map((o) => <OrderCard key={o.id} o={o} />)}
          </div>
        </>
      )}

      {!loading && delivered.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-ink/50 uppercase tracking-wide mb-3">
            Livrées ({delivered.length})
          </h2>
          <div className="space-y-3">
            {delivered.map((o) => <OrderCard key={o.id} o={o} />)}
          </div>
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg z-10"
            aria-label="Fermer"
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-8 text-white text-sm font-medium">{lightbox.alt}</p>
        </div>
      )}
    </div>
  );
}