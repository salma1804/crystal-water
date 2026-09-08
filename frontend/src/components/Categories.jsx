import React from 'react';
import { categoryPhotos } from '../data/categoryPhotos.js';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { categories } from '../i18n/translations.js';
import { categoryIcons } from '../data/categoryIcons.js';

const voirLabel = { fr: 'Voir', en: 'View', ar: 'عرض' };

export default function Categories() {
  const { t, lang } = useLang();

  return (
    
    <section id="categories" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-11 reveal">
          <h2 className="text-3xl font-bold mb-1">{t('cat_title')}</h2>
          <p className="text-ink/60 max-w-md text-sm">{t('cat_sub')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => {
            const photo = categoryPhotos[c.value];
            const icon = categoryIcons[c.value];
            return (
              <Link
                to={`/categorie/${c.value}`}
                key={c.value}
                className="group relative bg-white border border-ink/10 rounded p-5 hover:border-teal transition block"
              >
                {photo && (
                <img src={photo} alt={c[lang] || c.fr} className="w-full h-32 object-contain rounded mb-3" />
                  )}
                <div className="text-sm font-semibold mb-1">{c[lang] || c.fr}</div>
                

                <div className="absolute inset-0 rounded bg-tealDeep/0 group-hover:bg-tealDeep/85 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-semibold text-sm tracking-wide">
                    {voirLabel[lang] || voirLabel.fr} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
