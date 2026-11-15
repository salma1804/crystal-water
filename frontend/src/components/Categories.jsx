import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { categories } from '../i18n/translations.js';
import { categoryIcons } from '../data/categoryIcons.js';
import { categoryPhotos } from '../data/categoryPhotos.js';

const voirLabel = { fr: 'Voir les produits', en: 'View products', ar: 'عرض المنتجات' };

export default function Categories() {
  const { t, lang } = useLang();

  return (
    <section id="categories" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#07222d] mb-3">{t('cat_title')}</h2>
          <div className="w-14 h-1 rounded-full bg-[#15677f] mb-3" />
          <p className="text-[#4a6670] text-base leading-relaxed">{t('cat_sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((c) => {
            // grande photo de la catégorie, sinon la petite icône
            const img = categoryPhotos[c.value] || categoryIcons[c.value];
            return (
              <Link
                to={`/categorie/${c.value}`}
                key={c.value}
                className="group bg-white border border-[#d6e3e6] rounded-[20px] overflow-hidden flex flex-col transition duration-200 hover:-translate-y-1 hover:border-[#2bb7d6] hover:shadow-[0_22px_40px_-24px_rgba(21,103,127,.55)]"
              >
                <div className="aspect-[4/3] bg-gradient-to-b from-white to-[#e3f1f4] overflow-hidden flex items-center justify-center p-3">
                  {img ? (
                    <img
                      src={img}
                      alt={c[lang] || c.fr}
                      loading="lazy"
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="#15677f" fillOpacity=".25" aria-hidden="true">
                      <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" />
                    </svg>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-1.5 flex-1 border-t-[3px] border-[#15677f]">
                  <h3 className="font-display text-[18px] font-bold leading-tight text-[#07222d]">{c[lang] || c.fr}</h3>
                  {lang === 'fr' && <p className="text-sm text-[#4a6670] leading-snug line-clamp-2">{c.def}</p>}
                  <span className="mt-auto pt-3 text-sm font-semibold text-[#15677f]">
                    {voirLabel[lang] || voirLabel.fr} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
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
