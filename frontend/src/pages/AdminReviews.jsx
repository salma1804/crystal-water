import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export default function AdminReviews() {
  const { token } = useAdmin();
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
    await fetch(`/api/reviews/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, approved: true } : r)));
  };

  const reject = async (id) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews((rs) => rs.filter((r) => r.id !== id));
  };

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">Avis clients</h1>

      {loading && <p className="text-sm text-ink/50">Chargement...</p>}

      {!loading && (
        <>
          <h2 className="text-sm font-bold text-ink/70 uppercase tracking-wide mb-3">
            En attente ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-ink/40 mb-8">Aucun avis en attente.</p>
          ) : (
            <div className="space-y-3 mb-10">
              {pending.map((r) => (
                <div key={r.id} className="bg-white border border-ink/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{r.customer_name}</span>
                    <span className="text-gold text-sm">{stars(r.rating)}</span>
                  </div>
                  <p className="text-sm text-ink/70 mb-3">{r.message}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(r.id)}
                      className="px-4 py-1.5 bg-teal text-white text-xs font-semibold rounded hover:bg-tealLight transition"
                    >
                      ✓ Approuver
                    </button>
                    <button
                      onClick={() => reject(r.id)}
                      className="px-4 py-1.5 border border-red-300 text-red-500 text-xs font-semibold rounded hover:bg-red-50 transition"
                    >
                      ✕ Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-sm font-bold text-ink/50 uppercase tracking-wide mb-3">
            Publiés ({approved.length})
          </h2>
          <div className="space-y-3">
            {approved.map((r) => (
              <div key={r.id} className="bg-white border border-ink/5 rounded-lg p-4 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{r.customer_name}</span>
                  <span className="text-gold text-sm">{stars(r.rating)}</span>
                </div>
                <p className="text-sm text-ink/70 mb-2">{r.message}</p>
                <button
                  onClick={() => reject(r.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}