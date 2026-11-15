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
        <h1 className="font-display text-2xl font-extrabold text-[#07222d] mb-2">{t('cart_empty')}</h1>
        <p className="text-sm text-[#4a6670] mb-6">Ajoutez des produits à votre panier avant de passer commande.</p>
        <button
          onClick={() => navigate('/#categories')}
          className="px-7 py-3.5 bg-[#15677f] text-white font-semibold rounded-xl hover:bg-[#0c3a4a] transition"
        >
          Découvrir nos produits
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'form', label: 'Coordonnées' },
    { key: 'recap', label: 'Vérification' },
    { key: 'confirmed', label: 'Confirmation' },
  ];
  const stepIndex = steps.findIndex((x) => x.key === step);

  const stepper = (
    <ol className="flex items-center gap-2 sm:gap-3 mb-8 text-sm" aria-label="Étapes de la commande">
      {steps.map((x, i) => (
        <li key={x.key} className="flex items-center gap-2 sm:gap-3">
          <span className={`flex items-center gap-2 font-semibold ${i <= stepIndex ? 'text-[#07222d]' : 'text-[#8aa0a8]'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i < stepIndex ? 'bg-[#2c9a6a] text-white' : i === stepIndex ? 'bg-[#15677f] text-white' : 'bg-[#d6e3e6] text-[#4a6670]'
            }`}>
              {i < stepIndex ? '✓' : i + 1}
            </span>
            <span className="hidden sm:inline">{x.label}</span>
          </span>
          {i < steps.length - 1 && <span className={`w-6 sm:w-12 h-0.5 rounded ${i < stepIndex ? 'bg-[#2c9a6a]' : 'bg-[#d6e3e6]'}`} />}
        </li>
      ))}
    </ol>
  );

  const OrderSummaryCard = ({ sticky }) => (
    <div className={`bg-white border border-[#d6e3e6] rounded-2xl overflow-hidden ${sticky ? 'lg:sticky lg:top-24' : ''}`}>
      <div className="bg-[#07222d] text-white px-5 py-4 font-display text-lg font-bold">Votre commande</div>
      <div className="p-5">
        <div className="space-y-3 mb-4">
          {grouped.map((p) => {
            const photoSrc = p.hasRealPhoto
              ? (p.isCustom ? p.image : imgUrl(p.image))
              : (categoryIcons[p.cat] || '/product-images/placeholder.svg');
            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img src={photoSrc} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-[#e3f1f4]" />
                  {p.qty > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#2bb7d6] text-[#07222d] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {p.qty}
                    </span>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium leading-snug text-[#07222d]">{p.name}</span>
                <span className="font-display text-base font-bold text-[#07222d] flex-shrink-0">{p.price * p.qty} د.ت</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-[#d6e3e6]">
          <span className="text-base font-semibold text-[#33505b]">Total</span>
          <span className="font-display text-3xl font-extrabold text-[#07222d]">{total} د.ت</span>
        </div>
        <div className="mt-4 rounded-xl bg-[#edf4f5] px-4 py-3 text-sm text-[#33505b] space-y-1.5">
          <p>🚚 Livraison partout en Tunisie</p>
          <p>💵 Paiement à la livraison</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Seo title="Finaliser ma commande" description="Renseignez vos informations pour finaliser votre commande Crystal Water." />

      {stepper}

      {step === 'form' && (
        <>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#07222d] mb-1">Finaliser ma commande</h1>
          <p className="text-base text-[#4a6670] mb-8">Renseignez vos coordonnées de livraison. Vous payez à la réception.</p>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            <form onSubmit={goToRecap} className="bg-white border border-[#d6e3e6] rounded-2xl p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#07222d] mb-1.5">{t('form_name')}</label>
                  <input value={form.name} onChange={update('name')} placeholder={t('form_name_ph')} className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#07222d] mb-1.5">{t('form_phone')}</label>
                  <input value={form.phone} onChange={update('phone')} placeholder="+216 ..." className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#07222d] mb-1.5">{t('checkout_city')}</label>
                  <select
                    value={form.city}
                    onChange={update('city')}
                    className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition"
                  >
                    <option value="">— Choisissez votre ville —</option>
                    {Object.keys(TUNISIA_CITIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#07222d] mb-1.5">{t('checkout_address')}</label>
                  <input value={form.address} onChange={update('address')} placeholder={t('checkout_address_ph')} className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition" />
                </div>
              </div>

              <div className="mb-4">
                <LocationPicker value={position} onChange={setPosition} onLabelChange={setLocationLabel} city={form.city} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#07222d] mb-1.5">
                  Email <span className="font-normal text-[#8aa0a8]">(optionnel)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="pour recevoir la confirmation par email"
                  className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition"
                />
              </div>

              {error && <div className="bg-[#fdecea] text-[#a8321f] text-sm font-medium rounded-xl px-4 py-3 mb-4">{error}</div>}

              <button
                type="submit"
                className="w-full py-4 bg-[#15677f] text-white text-base font-semibold rounded-xl hover:bg-[#0c3a4a] transition"
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
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#07222d] mb-1">Récapitulatif</h1>
          <p className="text-base text-[#4a6670] mb-8">Vérifiez vos informations avant de confirmer.</p>

          <OrderSummaryCard />

          <div className="bg-white border border-[#d6e3e6] rounded-2xl p-5 mt-4">
            <p className="font-display text-lg font-bold text-[#07222d] mb-2">Livraison</p>
            <p className="text-base font-semibold text-[#07222d]">{form.name}</p>
            <p className="text-sm text-[#33505b]">{form.phone}</p>
            <p className="text-sm text-[#33505b]">{form.address}{form.city ? `, ${form.city}` : ''}</p>
            {position && <p className="text-sm text-[#15677f] font-medium mt-1">📍 {locationLabel || 'Position exacte indiquée sur la carte'}</p>}
            {form.email && <p className="text-sm text-[#4a6670] mt-1">{form.email}</p>}
          </div>

          {error && <div className="bg-[#fdecea] text-[#a8321f] text-sm font-medium rounded-xl px-4 py-3 mt-4">{error}</div>}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('form')}
              className="flex-1 py-4 border-[1.5px] border-[#d6e3e6] bg-white text-[#07222d] font-semibold rounded-xl hover:border-[#15677f] transition"
            >
              ← Modifier
            </button>
            <button
              onClick={confirmOrder}
              disabled={loading}
              className="flex-[2] py-4 bg-[#2bb7d6] text-[#07222d] text-base font-bold rounded-xl hover:bg-[#5fcbe3] transition disabled:opacity-50"
            >
              {loading ? '...' : 'Confirmer la commande'}
            </button>
          </div>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#2c9a6a] text-white flex items-center justify-center text-4xl">✓</div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#07222d] mb-2">Commande confirmée !</h1>
          <p className="text-base text-[#33505b] mb-1">Paiement à la livraison. Nous vous appelons bientôt.</p>
          <p className="text-base text-[#15677f] font-semibold mb-8">🚚 Livraison partout en Tunisie</p>

          {osmoseurItems.length > 0 && (
            <div className="space-y-3 mb-8 text-left">
              {osmoseurItems.map((item) => (
                <ReminderOptIn key={item.id} productName={item.name} cat={item.cat} />
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-[#15677f] text-white font-semibold rounded-xl hover:bg-[#0c3a4a] transition"
          >
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}
