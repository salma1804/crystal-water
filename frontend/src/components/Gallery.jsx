import React, { useState, useRef } from 'react';
import { useLang } from '../context/LangContext.jsx';

const items = [
  { id: 32418620, caption: "Traitement industriel" },
  { id: 2101147, caption: "Eau claire, sans arrière-goût" },
  { id: 304784, caption: "Filtration en action" },
  { id: 31403876, caption: "Stockage & distribution" },
  { id: 3124674, caption: "Le résultat, au quotidien" },
  { id: 11820859, caption: "Secteur maritime" },
  { id: 12810604, caption: "Grands navires industriels" },
  { id: 4108676, caption: "À la maison" },
  { id: 7290611, caption: "Industrie cosmétique" },
  { id: 31023487, caption: "Départements & sites commerciaux" },
];

export default function Gallery() {
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  const startPlaying = () => {
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 1200);
  };

  const stopPlaying = () => {
    clearInterval(intervalRef.current);
  };

  const current = items[index];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-11 reveal">
          <h2 className="text-3xl font-bold mb-1">{t('gallery_title')}</h2>
          <p className="text-ink/60 max-w-md text-sm">{t('gallery_sub')}</p>
        </div>

        <div className="flex items-center gap-6 reveal">
          <div className="relative rounded-lg overflow-hidden flex-1 max-w-2xl aspect-[16/10]">
            <img
              src={`https://images.pexels.com/photos/${current.id}/pexels-photo-${current.id}.jpeg?auto=compress&cs=tinysrgb&w=900`}
              alt={current.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white text-base font-semibold">
              {current.caption}
            </div>
          </div>

          <button
            onMouseEnter={startPlaying}
            onMouseLeave={stopPlaying}
            aria-label="Voir la galerie"
            className="w-14 h-14 rounded-full border border-ink/15 flex items-center justify-center text-xl text-teal hover:bg-teal hover:text-white hover:border-teal transition flex-shrink-0"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}