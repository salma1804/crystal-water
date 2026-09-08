import React, { useState } from 'react';

export default function ReminderOptIn({ productName, cat }) {
  const [phone, setPhone] = useState('');
  const [months, setMonths] = useState(6);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/[\s\-\.]/g, '');
    if (!/^(\+216)?[2-9]\d{7}$/.test(cleaned)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          product_name: productName,
          cat,
          interval_months: months,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="bg-mineral2 rounded-lg p-4 text-sm text-tealDeep flex items-center gap-2">
        ✅ C'est noté ! On vous rappellera sur WhatsApp pour changer vos filtres.
      </div>
    );
  }

  return (
    <div className="border border-ink/10 rounded-lg p-4">
            <div className="text-sm font-semibold mb-1 flex items-center gap-2">
        🔔 Rappel pour : {productName}
      </div>
      <p className="text-xs text-ink/60 mb-3">
        On vous envoie un message WhatsApp au bon moment pour ne jamais oublier de changer vos cartouches.
      </p>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+216 XX XXX XXX"
            className="flex-1 px-3 py-2 border border-ink/15 rounded text-sm focus:outline-none focus:border-teal transition"
          />
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="px-2 py-2 border border-ink/15 rounded text-sm bg-white"
          >
            <option value={6}>6 mois</option>
            <option value={12}>12 mois</option>
          </select>
        </div>
        {status === 'error' && (
          <p className="text-xs text-red-500">Merci d'entrer un numéro de téléphone valide.</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="py-2 bg-teal text-white text-sm font-semibold rounded hover:bg-tealLight transition disabled:opacity-60"
        >
          {status === 'loading' ? 'Inscription...' : "M'inscrire au rappel"}
        </button>
      </form>
    </div>
  );
}