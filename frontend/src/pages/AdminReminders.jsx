import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';

export default function AdminReminders() {
  const { token } = useAdmin();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reminders/due', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setReminders(data.reminders || []);
    } catch (err) {
      setError("Impossible de charger les rappels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const markSent = async (id) => {
    try {
      await fetch(`/api/reminders/${id}/sent`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((rs) => rs.filter((r) => r.id !== id));
    } catch {
      alert("Impossible de marquer ce rappel comme envoyé, réessayez.");
    }
  };

  const waLink = (r) => {
    const message = `Bonjour ! Il y a ${r.interval_months} mois, vous avez acheté "${r.product_name}" chez Crystal Water. C'est le moment idéal pour changer vos filtres/cartouches et garder une eau parfaitement pure. Voulez-vous qu'on vous prépare le nécessaire ?`;
    const cleanPhone = r.phone.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Rappels à envoyer</h1>
          <p className="text-sm text-ink/60 mt-1">
            Clients dont la date de rappel de changement de filtres est arrivée.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 border border-ink/15 rounded text-sm font-semibold hover:border-teal transition"
        >
          ↻ Actualiser
        </button>
      </div>

      {loading && <p className="text-sm text-ink/50">Chargement...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && reminders.length === 0 && (
        <div className="bg-mineral2 rounded-lg p-8 text-center text-sm text-ink/50">
          Aucun rappel en attente pour le moment. 🎉
        </div>
      )}

      <div className="space-y-3">
        {reminders.map((r) => (
          <div key={r.id} className="bg-white border border-ink/10 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-semibold">{r.product_name}</div>
              <div className="text-xs text-ink/60 mt-0.5">
                📞 {r.phone} — inscrit il y a {r.interval_months} mois — rappel prévu le{' '}
                {new Date(r.remind_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a
                href={waLink(r)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] text-white text-xs font-semibold rounded hover:opacity-90 transition"
              >
                Envoyer sur WhatsApp
              </a>
              <button
                onClick={() => markSent(r.id)}
                className="px-4 py-2 border border-ink/15 text-xs font-semibold rounded hover:border-teal transition"
              >
                Marquer envoyé
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}