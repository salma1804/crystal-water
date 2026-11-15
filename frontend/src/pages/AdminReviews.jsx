import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { Icon, useAdminStats } from '../components/AdminShell.jsx';

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export default function AdminReviews() {
  const { token } = useAdmin();
  const { refresh } = useAdminStats();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/reviews/all', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const approve = async (id) => {
    const res = await fetch(`/api/reviews/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { alert("L'avis n'a pas pu être approuvé. Réessayez."); return; }
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, approved: true } : r)));
    refresh();
  };

  const reject = async (id) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { alert("L'avis n'a pas pu être supprimé. Réessayez."); return; }
    setReviews((rs) => rs.filter((r) => r.id !== id));
    refresh();
  };

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Avis clients</h1>
          <p className="adm-sub">Un avis n'apparaît sur le site qu'après votre approbation.</p>
        </div>
      </div>

      {loading && <p className="adm-loading">Chargement des avis…</p>}

      {!loading && (
        <>
          <div className="adm-section-label">À modérer <span className="adm-chip adm-chip--amber">{pending.length}</span></div>
          {pending.length === 0 ? (
            <div className="adm-empty"><b>Aucun avis en attente</b>Les nouveaux avis laissés sur le site arriveront ici.</div>
          ) : (
            <div className="adm-list">
              {pending.map((r) => (
                <div key={r.id} className="adm-card">
                  <div className="adm-card__top">
                    <span className="adm-card__name">{r.customer_name}</span>
                    <span className="adm-stars" aria-label={`${r.rating} sur 5`}>{stars(r.rating)}</span>
                  </div>
                  <p>{r.message}</p>
                  <div className="adm-card__actions">
                    <button onClick={() => approve(r.id)} className="adm-btn adm-btn--ok"><Icon name="check" size={16} /> Approuver</button>
                    <button onClick={() => reject(r.id)} className="adm-btn adm-btn--danger">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="adm-section-label">Publiés <span className="adm-chip adm-chip--kelp">{approved.length}</span></div>
          <div className="adm-list">
            {approved.map((r) => (
              <div key={r.id} className="adm-card dim">
                <div className="adm-card__top">
                  <span className="adm-card__name">{r.customer_name}</span>
                  <span className="adm-stars">{stars(r.rating)}</span>
                </div>
                <p>{r.message}</p>
                <div className="adm-card__actions">
                  <button onClick={() => reject(r.id)} className="adm-btn adm-btn--danger adm-btn--sm">Retirer du site</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
