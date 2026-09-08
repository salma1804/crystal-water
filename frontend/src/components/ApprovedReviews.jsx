import React, { useEffect, useState } from 'react';

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export default function ApprovedReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Ce que disent nos clients</h2>
          <p className="text-sm text-ink/60">Des avis vérifiés de clients Crystal Water.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-ink/10 rounded-xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="text-gold text-lg mb-2">{stars(r.rating)}</div>
              <p className="text-sm text-ink/70 leading-relaxed mb-4">"{r.message}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold text-sm">
                  {r.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.customer_name}</p>
                  <p className="text-xs text-ink/40">
                    {new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}