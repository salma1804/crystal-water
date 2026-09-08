import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

const LOCAL_ORDERS_KEY = 'crystalwater_my_orders';

function OrderCard({ o }) {
  return (
    <div className="bg-white border border-ink/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-ink/50">
          {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            o.delivered ? 'bg-teal/10 text-tealDeep' : 'bg-gold/20 text-ink'
          }`}
        >
          {o.delivered ? '✓ Livrée' : '⏳ En cours'}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        {(o.items || []).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-ink/70">
            {item.photo && (
              <img src={item.photo} alt={item.name} className="w-8 h-8 rounded object-cover bg-aqua flex-shrink-0" />
            )}
            <span>{item.name} — {item.price} د.ت</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-tealDeep">Total : {o.total} د.ت</div>
        <div className="font-mono text-xs text-ink/40">{o.order_code}</div>
      </div>
    </div>
  );
}

function ResendCodeForm() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (phone.trim().length < 8) {
      setStatus('error');
      setMessage('Entrez un numéro de téléphone valide.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/orders/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('done');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || "Impossible d'envoyer le code.");
    }
  };

  if (status === 'done') {
    return <p className="text-sm text-teal">✅ {message}</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+216 XX XXX XXX"
        className="w-full px-4 py-3 border border-ink/15 rounded text-sm focus:outline-none focus:border-teal transition"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 bg-teal text-white font-semibold rounded hover:bg-tealLight transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Envoi...' : 'Recevoir mon code par email'}
      </button>
      {status === 'error' && <p className="text-sm text-red-500">{message}</p>}
    </form>
  );
}

export default function MyOrders() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const [autoOrders, setAutoOrders] = useState([]);
  const [autoLoading, setAutoLoading] = useState(true);

  useEffect(() => {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
    } catch {
      saved = [];
    }

    if (saved.length === 0) {
      setAutoLoading(false);
      return;
    }

    Promise.all(
      saved.map((s) =>
        fetch(`/api/orders/track?phone=${encodeURIComponent(s.phone)}&code=${encodeURIComponent(s.code)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => d?.order)
          .catch(() => null)
      )
    ).then((results) => {
      setAutoOrders(results.filter(Boolean));
      setAutoLoading(false);
    });
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (phone.trim().length < 8 || code.trim().length < 3) {
      setError('Entrez votre numéro de téléphone et votre code de suivi.');
      return;
    }
    setError('');
    setLoading(true);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(phone.trim())}&code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Introuvable');
      setOrder(data.order);
    } catch (err) {
      setError(err.message === 'Introuvable' ? err.message : 'Aucune commande trouvée avec ces informations.');
    } finally {
      setLoading(false);
    }
  };

  const hasAnyOrders = autoOrders.length > 0 || order !== null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Seo
        title="Mes commandes"
        description="Consultez le statut de vos commandes Crystal Water."
      />

      <h1 className="text-2xl font-bold mb-8">Mes commandes</h1>

      {autoLoading ? (
        <p className="text-sm text-ink/50">Chargement...</p>
      ) : (
        <>
          {!hasAnyOrders && (
            <div className="text-center py-12 mb-8">
              <div className="text-5xl mb-4">💧</div>
              <h2 className="text-lg font-bold mb-2">Pas encore de commande</h2>
              <p className="text-sm text-ink/60 max-w-sm mx-auto mb-6">
                Rejoignez la famille Crystal Water ! Découvrez notre gamme d'osmoseurs, adoucisseurs
                et équipements de traitement d'eau, et passez votre première commande dès aujourd'hui.
              </p>
              <Link
                to="/#categories"
                className="inline-block px-6 py-3 bg-teal text-white font-semibold rounded hover:bg-tealLight transition"
              >
                Découvrir nos produits
              </Link>
            </div>
          )}

          {autoOrders.length > 0 && (
            <div className="space-y-3 mb-8">
              {autoOrders.map((o) => <OrderCard key={o.id} o={o} />)}
            </div>
          )}

          <div className="border-t border-ink/10 pt-6 space-y-4">
            {!showManualSearch ? (
              <button
                onClick={() => setShowManualSearch(true)}
                className="text-sm text-teal font-semibold hover:underline block"
              >
                J'ai déjà commandé depuis un autre appareil →
              </button>
            ) : (
              <div>
                <p className="text-sm text-ink/60 mb-4">
                  Entrez le numéro de téléphone et le code de suivi reçus à la confirmation de votre commande.
                </p>
                <form onSubmit={search} className="space-y-3 mb-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 XX XXX XXX"
                    className="w-full px-4 py-3 border border-ink/15 rounded text-sm focus:outline-none focus:border-teal transition"
                  />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code de suivi (ex : CW-8F3K2A)"
                    className="w-full px-4 py-3 border border-ink/15 rounded text-sm font-mono focus:outline-none focus:border-teal transition"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-teal text-white font-semibold rounded hover:bg-tealLight transition disabled:opacity-50"
                  >
                    {loading ? '...' : 'Rechercher'}
                  </button>
                </form>

                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                {order && <OrderCard o={order} />}
              </div>
            )}

            {!showResend ? (
              <button
                onClick={() => setShowResend(true)}
                className="text-sm text-teal font-semibold hover:underline block"
              >
                J'ai perdu mon code de suivi →
              </button>
            ) : (
              <div>
                <p className="text-sm text-ink/60 mb-4">
                  Si vous aviez donné votre email à la commande, on vous renvoie votre code.
                </p>
                <ResendCodeForm />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}