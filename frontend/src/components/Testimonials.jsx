import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { imgUrl } from '../data/products.js';

const testimonials = [
  { quote: "Installation rapide et propre, l'eau n'a vraiment plus le même goût. L'équipe a expliqué chaque étape.", name: "Amira B.", role: "Cliente particulière, Sfax", img: 3124674, rating: 5 },
  { quote: "Notre adoucisseur industriel tombait en panne tous les 2 mois avec l'ancien prestataire. Depuis Crystal Water, plus aucun souci.", name: "Karim T.", role: "Responsable technique, usine textile", img: 2101147, rating: 5 },
  { quote: "Le diagnostic gratuit m'a évité d'acheter un système surdimensionné. Service honnête.", name: "Sami R.", role: "Client particulier, Sousse", img: 304784, rating: 4 },
];

function stars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export default function Testimonials() {
  const { t } = useLang();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, []);

  const current = testimonials[index];

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-11 reveal">{t('testi_title')}</h2>
        <div className="reveal">
          <div className="text-gold tracking-widest text-lg mb-3">{stars(current.rating)}</div>
          <p className="text-xl font-display text-tealDeep mb-5">"{current.quote}"</p>
          <div className="flex items-center justify-center gap-3">
            <img src={imgUrl(current.img)} alt={current.name} className="w-11 h-11 rounded-full object-cover" />
            <div className="text-left">
              <b className="text-sm block">{current.name}</b>
              <span className="text-xs text-ink/55">{current.role}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-center mt-7">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full ${i === index ? 'bg-teal' : 'bg-ink/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
