import React, { useState } from 'react';

export default function ReviewForm() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: name, rating, message }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
      setName('');
      setMessage('');
      setRating(5);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <section className="py-16 bg-mineral2">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="text-5xl mb-4">💧</div>
          <h3 className="text-xl font-bold mb-2">Merci pour votre avis !</h3>
          <p className="text-sm text-ink/60">Il sera publié après vérification par notre équipe.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-mineral2">
      <div className="max-w-lg mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" fill="#2E93C4" opacity="0.85"/>
            </svg>
            <h2 className="text-2xl font-bold">Votre avis compte</h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ transform: 'scaleX(-1)' }}>
              <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" fill="#6EC8E6" opacity="0.85"/>
            </svg>
          </div>
          <p className="text-sm text-ink/60">Partagez votre expérience avec Crystal Water.</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-7">
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1.5">Votre nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Salma B."
              className="w-full px-4 py-3 border border-ink/15 rounded-lg text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Votre note</label>
            <div className="flex gap-1.5" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    n <= (hoverRating || rating) ? 'text-gold' : 'text-ink/15'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1.5">Votre commentaire</label>
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Qu'avez-vous pensé de nos produits ou de notre service ?"
              className="w-full px-4 py-3 border border-ink/15 rounded-lg text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition resize-none"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-500 mb-4">Une erreur est survenue, réessayez.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 bg-teal text-white font-semibold rounded-lg hover:bg-tealLight transition disabled:opacity-50 shadow-lg shadow-teal/20"
          >
            {status === 'loading' ? 'Envoi...' : '✨ Envoyer mon avis'}
          </button>
        </form>
      </div>
    </section>
  );
}