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

  const labels = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];
  const shown = hoverRating || rating;

  if (status === 'done') {
    return (
      <section className="py-20">
        <div className="max-w-md mx-auto px-6 text-center bg-white border border-[#d6e3e6] rounded-3xl p-10 shadow-[0_24px_50px_-30px_rgba(7,34,45,.45)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2c9a6a] text-white flex items-center justify-center text-3xl">✓</div>
          <h3 className="font-display text-2xl font-bold text-[#07222d] mb-2">Merci pour votre avis !</h3>
          <p className="text-[#4a6670]">Il sera publié après vérification par notre équipe.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
        <div className="lg:pt-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#07222d] mb-3">Votre avis compte</h2>
          <div className="w-14 h-1 rounded-full bg-[#15677f] mb-3" />
          <p className="text-[#4a6670] text-base leading-relaxed max-w-md">Partagez votre expérience avec Crystal Water.</p>
          <ul className="mt-8 space-y-4 text-[#33505b]">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-full bg-[#15677f]/10 text-[#15677f] flex items-center justify-center text-sm font-bold">✓</span>
              <span>Vos avis aident d'autres clients à choisir le bon équipement.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-7 h-7 flex-shrink-0 rounded-full bg-[#15677f]/10 text-[#15677f] flex items-center justify-center text-sm font-bold">✓</span>
              <span>Chaque avis est vérifié par notre équipe avant d'être publié.</span>
            </li>
          </ul>
        </div>

        <form onSubmit={submit} className="bg-white border border-[#d6e3e6] rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_-30px_rgba(7,34,45,.45)]">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#07222d] mb-1.5">Votre nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Salma B."
              className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#07222d] mb-2">Votre note</label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    aria-label={`${n} sur 5`}
                    className={`text-4xl leading-none transition-transform hover:scale-110 ${
                      n <= shown ? 'text-[#e3a93b]' : 'text-[#d6e3e6]'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-sm font-semibold text-[#15677f]">{labels[shown]}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#07222d] mb-1.5">Votre commentaire</label>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Qu'avez-vous pensé de nos produits ou de notre service ?"
              className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition resize-none"
            />
          </div>

          {status === 'error' && (
            <p className="bg-[#fdecea] text-[#a8321f] text-sm font-medium rounded-xl px-4 py-3 mb-4">Une erreur est survenue, réessayez.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 bg-[#15677f] text-white text-base font-semibold rounded-xl hover:bg-[#0c3a4a] transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Envoi...' : 'Envoyer mon avis'}
          </button>
        </form>
      </div>
    </section>
  );
}