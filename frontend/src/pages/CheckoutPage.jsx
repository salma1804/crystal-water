import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';
import ReminderOptIn from '../components/ReminderOptIn.jsx';
import LocationPicker, { TUNISIA_CITIES } from '../components/LocationPicker.jsx';
import Seo from '../components/Seo.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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

export default function CheckoutPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', email: '' });
  const [position, setPosition] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState('form');
  const [osmoseurItems, setOsmoseurItems] = useState([]);

  const grouped = groupCart(cart);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isValidTunisianPhone = (phone) => {
    const cleaned = phone.replace(/[\s\-\.]/g, '');
    return /^(\+216)?[2-9]\d{7}$/.test(cleaned);
  };

  const goToRecap = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(t('checkout_error'));
      return;
    }
    if (!isValidTunisianPhone(form.phone)) {
      setError('Numéro de téléphone invalide (8 chiffres, format tunisien).');
      return;
    }
    setError('');
    setStep('recap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmOrder = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          email: form.email.trim() || undefined,
          latitude: position ? position[0] : undefined,
          longitude: position ? position[1] : undefined,
          location_label: locationLabel || undefined,
          items: cart.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            photo: p.hasRealPhoto
              ? (p.isCustom ? p.image : imgUrl(p.image))
              : (categoryIcons[p.cat] || '/product-images/placeholder.svg'),
          })),
          total
        })
      });

      if (!res.ok) throw new Error('request failed');

      const uniqueOsmoseurs = Array.from(
        new Map(cart.filter((p) => p.cat === 'osmoseurs').map((p) => [p.id, p])).values()
      );
      setOsmoseurItems(uniqueOsmoseurs);
      clearCart();
      setStep('confirmed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(t('checkout_submit_error'));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 'confirmed') {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <Seo title="Commande" description="Finalisez votre commande Crystal Water." />
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-xl font-bold mb-2">{t('cart_empty')}</h1>
        <p className="text-sm text-ink/60 mb-6">Ajoutez des produits à votre panier avant de passer commande.</p>
        <button
          onClick={() => navigate('/#categories')}
          className="px-6 py-3 bg-teal text-white font-semibold rounded hover:bg-tealLight transition"
        >
          Découvrir nos produits
        </button>
      </div>
    );
  }

  const OrderSummaryCard = ({ sticky }) => (
    <div className={`bg-white border border-ink/10 rounded-xl p-5 ${sticky ? 'lg:sticky lg:top-24' : ''}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-ink/40 mb-3">Votre commande</p>
      <div className="space-y-3 mb-4">
        {grouped.map((p) => {
          const photoSrc = p.hasRealPhoto
            ? (p.isCustom ? p.image : imgUrl(p.image))
            : (categoryIcons[p.cat] || '/product-images/placeholder.svg');
          return (
            <div key={p.id} className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img src={photoSrc} alt={p.name} className="w-12 h-12 rounded object-cover bg-aqua" />
                {p.qty > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {p.qty}
                  </span>
                )}
              </div>
              <span className="flex-1 text-sm leading-tight">{p.name}</span>
              <span className="font-mono text-sm font-semibold text-tealDeep flex-shrink-0">{p.price * p.qty} د.ت</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-ink/10">
        <span className="text-sm font-semibold">Total</span>
        <span className="font-mono text-xl font-bold text-tealDeep">{total} د.ت</span>
      </div>
      <div className="mt-4 text-xs text-ink/50 space-y-1">
        <p>🚚 Livraison partout en Tunisie</p>
        <p>💵 Paiement à la livraison</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Seo title="Finaliser ma commande" description="Renseignez vos informations pour finaliser votre commande Crystal Water." />

      {step === 'form' && (
        <>
          <h1 className="font-display text-3xl font-bold mb-1">Finaliser ma commande</h1>
          <p className="text-sm text-ink/60 mb-8">Renseignez vos coordonnées de livraison.</p>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <form onSubmit={goToRecap} className="bg-white border border-ink/10 rounded-xl p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('form_name')}</label>
                  <input value={form.name} onChange={update('name')} placeholder={t('form_name_ph')} className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('form_phone')}</label>
                  <input value={form.phone} onChange={update('phone')} placeholder="+216 ..." className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('checkout_city')}</label>
                  <select
                    value={form.city}
                    onChange={update('city')}
                    className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm bg-white"
                  >
                    <option value="">— Choisissez votre ville —</option>
                    {Object.keys(TUNISIA_CITIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t('checkout_address')}</label>
                  <input value={form.address} onChange={update('address')} placeholder={t('checkout_address_ph')} className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm" />
                </div>
              </div>

              <div className="mb-4">
                <LocationPicker value={position} onChange={setPosition} onLabelChange={setLocationLabel} city={form.city} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1.5">
                  Email <span className="font-normal text-ink/40">(optionnel)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="pour recevoir la confirmation par email"
                  className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm"
                />
              </div>

              {error && <div className="text-red-700 text-sm mb-4">{error}</div>}

              <button
                type="submit"
                className="w-full py-3.5 bg-teal text-white font-semibold rounded hover:bg-tealLight transition"
              >
                Vérifier ma commande →
              </button>
            </form>

            <div>
              <OrderSummaryCard sticky />
            </div>
          </div>
        </>
      )}

      {step === 'recap' && (
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-1">Récapitulatif</h1>
          <p className="text-sm text-ink/60 mb-8">Vérifiez vos informations avant de confirmer.</p>

          <OrderSummaryCard />

          <div className="bg-white border border-ink/10 rounded-xl p-5 mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/40 mb-2">Livraison</p>
            <p className="text-sm font-semibold">{form.name}</p>
            <p className="text-sm text-ink/70">{form.phone}</p>
            <p className="text-sm text-ink/70">{form.address}{form.city ? `, ${form.city}` : ''}</p>
            {position && <p className="text-xs text-teal mt-1">📍 {locationLabel || 'Position exacte indiquée sur la carte'}</p>}
            {form.email && <p className="text-xs text-ink/50 mt-1">{form.email}</p>}
          </div>

          {error && <div className="text-red-700 text-sm mt-4">{error}</div>}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('form')}
              className="flex-1 py-3.5 border border-ink/15 text-ink font-semibold rounded-lg hover:border-teal transition"
            >
              ← Modifier
            </button>
            <button
              onClick={confirmOrder}
              disabled={loading}
              className="flex-[2] py-3.5 bg-teal text-white font-semibold rounded-lg hover:bg-tealLight transition disabled:opacity-50"
            >
              {loading ? '...' : 'Confirmer la commande'}
            </button>
          </div>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="font-display text-3xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-sm text-ink/60 mb-1">Paiement à la livraison. Nous vous appelons bientôt.</p>
          <p className="text-sm text-teal font-semibold mb-8">🚚 Livraison partout en Tunisie</p>

          {osmoseurItems.length > 0 && (
            <div className="space-y-3 mb-8 text-left">
              {osmoseurItems.map((item) => (
                <ReminderOptIn key={item.id} productName={item.name} cat={item.cat} />
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 bg-teal text-white font-semibold rounded-lg hover:bg-tealLight transition"
          >
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}