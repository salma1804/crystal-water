import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Icon, useAdminStats } from '../components/AdminShell.jsx';

export default function AdminReminders() {
  const { token } = useAdmin();
  const { refresh } = useAdminStats();
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
      setError('Les rappels n\'ont pas pu être chargés. Réessayez.');
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
      const res = await fetch(`/api/reminders/${id}/sent`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setReminders((rs) => rs.filter((r) => r.id !== id));
      refresh();
    } catch {
      alert('Le rappel n\'a pas pu être marqué comme envoyé. Réessayez.');
    }
  };

  const waLink = (r) => {
    const message = `Bonjour ! Il y a ${r.interval_months} mois, vous avez acheté "${r.product_name}" chez Crystal Water. C'est le moment idéal pour changer vos filtres/cartouches et garder une eau parfaitement pure. Voulez-vous qu'on vous prépare le nécessaire ?`;
    const cleanPhone = r.phone.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Rappels de filtres</h1>
          <p className="adm-sub">Clients dont la date de changement de cartouches est arrivée. Contactez-les sur WhatsApp, puis marquez le rappel comme envoyé.</p>
        </div>
        <button className="adm-btn adm-btn--ghost" onClick={load}><Icon name="refresh" size={16} /> Actualiser</button>
      </div>

      {loading && <p className="adm-loading">Chargement des rappels…</p>}
      {error && <div className="adm-error" role="alert"><Icon name="alert" size={18} /> <span>{error}</span></div>}

      {!loading && !error && reminders.length === 0 && (
        <div className="adm-empty">
          <b>Aucun rappel à envoyer</b>
          Quand un client devra changer ses filtres, il apparaîtra ici.
        </div>
      )}

      <div className="adm-list">
        {reminders.map((r) => (
          <div key={r.id} className="adm-card">
            <div className="adm-card__top">
              <span className="adm-card__name">{r.product_name}</span>
              <span className="adm-card__meta">Prévu le {new Date(r.remind_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>
              <span className="adm-num">{r.phone}</span> · acheté il y a {r.interval_months} mois
            </p>
            <div className="adm-card__actions">
              <a href={waLink(r)} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--wa">Écrire sur WhatsApp</a>
              <button onClick={() => markSent(r.id)} className="adm-btn adm-btn--ghost">Marquer comme envoyé</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
