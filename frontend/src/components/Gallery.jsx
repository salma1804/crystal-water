import React from 'react';
import { useLang } from '../context/LangContext.jsx';

const items = [
  { id: 32418620, caption: 'Traitement industriel', big: true },
  { id: 2101147, caption: 'Eau claire, sans arrière-goût' },
  { id: 304784, caption: 'Filtration en action' },
  { id: 31403876, caption: 'Stockage & distribution' },
  { id: 3124674, caption: 'Le résultat, au quotidien' },
];

export default function Gallery() {
  const { t } = useLang();

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#07222d] mb-3">{t('gallery_title')}</h2>
          <div className="w-14 h-1 rounded-full bg-[#15677f] mb-3" />
          <p className="text-[#4a6670] text-base leading-relaxed">{t('gallery_sub')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]">
          {items.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-3xl overflow-hidden group ${item.big ? 'sm:col-span-2 sm:row-span-2' : ''}`}
            >
              <img
                src={`https://images.pexels.com/photos/${item.id}/pexels-photo-${item.id}.jpeg?auto=compress&cs=tinysrgb&w=${item.big ? 1100 : 700}`}
                alt={item.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#07222d]/85 to-transparent text-white font-display font-semibold text-lg">
                {item.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
