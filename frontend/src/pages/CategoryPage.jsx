import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { categories } from '../i18n/translations.js';
import { subcategories } from '../data/subcategories.js';
import { accessoireTypes } from '../data/accessoireTypes.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { imgUrl } from '../data/products.js';
import { categoryIcons } from '../data/categoryIcons.js';
import { categoryPhotos } from '../data/categoryPhotos.js';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';

function DropletTitle({ text, size = 'text-3xl' }) {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" fill="#2E93C4" opacity="0.85"/>
        </svg>
        <h2 className={`${size} font-bold text-tealDeep`}>{text}</h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: 'scaleX(-1)' }}>
          <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" fill="#6EC8E6" opacity="0.85"/>
        </svg>
      </div>
      <div className="w-16 h-0.5 bg-teal/40 mx-auto mt-3 rounded-full" />
    </div>
  );
}

function SortBar({ sort, onSort, waveRef }) {
  return (
    <div className="flex justify-end mb-6">
      <div className="relative flex bg-mineral2 rounded-full p-1 border border-ink/10 max-w-md w-full">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-full overflow-hidden transition-transform duration-500"
          style={{
            width: 'calc(33.33% - 4px)',
            transform: `translateX(${sort === 'price-asc' ? '0%' : sort === 'price-desc' ? '100%' : '200%'})`,
          }}
        >
          <svg viewBox="0 0 120 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path ref={waveRef} d="M0,10 Q30,0 60,10 T120,10 L120,40 L0,40 Z" fill="#2E93C4" />
          </svg>
        </div>
        {[
          { v: 'price-asc', label: 'Prix croissant' },
          { v: 'price-desc', label: 'Prix décroissant' },
          { v: 'discount', label: 'Meilleures promos' },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => onSort(opt.v)}
            className="relative flex-1 py-2.5 text-xs font-semibold rounded-full z-10 transition-colors"
            style={{ color: sort === opt.v ? 'white' : 'var(--ink, #0F2B3D)', opacity: sort === opt.v ? 1 : 0.6 }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useProducts();

  const activeSubcat = searchParams.get('subcat');
  const activeType = searchParams.get('type');
  const sort = searchParams.get('sort') || 'price-asc';
  const openProductId = searchParams.get('openProduct');

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (activeSubcat) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [activeSubcat]);

  useEffect(() => {
    if (openProductId) {
      const timeout = setTimeout(() => {
        const next = new URLSearchParams(searchParams);
        next.delete('openProduct');
        setSearchParams(next, { replace: true });
      }, 800);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProductId]);

  const setActiveSubcat = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('subcat', val); else next.delete('subcat');
    next.delete('type');
    setSearchParams(next);
  };
  const setActiveType = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('type', val); else next.delete('type');
    setSearchParams(next);
  };
  const setSort = (val) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', val);
    setSearchParams(next);
  };

  const requestClose = () => {
    setVisible(false);
    setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete('subcat');
      next.delete('type');
      setSearchParams(next);
    }, 280);
  };

  const category = categories.find((c) => c.value === slug);
  const icon = categoryIcons[slug];
  const photo = categoryPhotos[slug];

  const catSubcategories = subcategories.filter((s) => s.cat === slug);
  const activeSubcatData = subcategories.find((s) => s.value === activeSubcat);

  const wavePathSortRef = useRef(null);

  useEffect(() => {
    let t = 0;
    const anim = setInterval(() => {
      t += 0.12;
      const y1 = 10 + Math.sin(t) * 4;
      const y2 = 10 + Math.sin(t + 1.4) * 4;
      if (wavePathSortRef.current) {
        wavePathSortRef.current.setAttribute('d', `M0,${y1} Q30,${y1 - 8} 60,${y1} T120,${y2} L120,40 L0,40 Z`);
      }
    }, 45);
    return () => clearInterval(anim);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeSubcat ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeSubcat]);

  const isAccessoiresView = activeSubcat === 'osmoseur-accessoires';

  const accessoireProducts = products.filter((p) => p.cat === slug && p.subcat === 'osmoseur-accessoires');

  const albums = accessoireTypes.map((typ) => {
    const items = accessoireProducts.filter((p) => (p.types || ['raccordement']).includes(typ.value));
    const cover = items.find((p) => p.hasRealPhoto);
    return { ...typ, count: items.length, coverSrc: cover ? imgUrl(cover.image) : null };
  });

  const activeAlbum = albums.find((a) => a.value === activeType);

  let list = products.filter(
    (p) =>
      p.cat === slug &&
      (!activeSubcat || p.subcat === activeSubcat) &&
      (!activeType || (p.types || ['raccordement']).includes(activeType))
  );

  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === 'discount') list = [...list].sort((a, b) => b.discount - a.discount);

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 mb-6">Catégorie introuvable.</p>
        <Link to="/" className="text-teal font-semibold">← Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <Seo
        title={category.fr}
        description={category.def || `Découvrez notre gamme de ${category.fr} — Crystal Water Tunisie.`}
      />

      <Link to="/#categories" className="text-sm text-teal font-semibold mb-6 inline-block">
        ← {lang === 'ar' ? 'كل الفئات' : lang === 'en' ? 'All categories' : 'Toutes les catégories'}
      </Link>

      {photo && (
        <img src={photo} alt={category.fr} className="w-full h-64 object-contain rounded-lg mb-6" />
      )}

      <div className="flex items-center gap-4 mb-3">
        {icon && <img src={icon} alt={category[lang] || category.fr} className="w-12 h-12 object-contain" />}
        <h1 className="text-3xl font-bold">{category[lang] || category.fr}</h1>
      </div>

      <div className="mb-10" />

      {catSubcategories.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-8">
          <button
            onClick={() => setActiveSubcat(null)}
            className={`px-5 py-2.5 rounded-full border-[1.5px] text-sm font-semibold transition ${
              !activeSubcat
                ? 'bg-[#15677f] text-white border-[#15677f] shadow-[0_10px_20px_-12px_rgba(21,103,127,.8)]'
                : 'bg-white text-[#07222d] border-[#d6e3e6] hover:border-[#15677f] hover:text-[#15677f] hover:-translate-y-0.5'
            }`}
          >
            Tout voir
          </button>
          {catSubcategories.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveSubcat(s.value)}
              className={`px-5 py-2.5 rounded-full border-[1.5px] text-sm font-semibold transition ${
                activeSubcat === s.value
                  ? 'bg-[#15677f] text-white border-[#15677f] shadow-[0_10px_20px_-12px_rgba(21,103,127,.8)]'
                  : 'bg-white text-[#07222d] border-[#d6e3e6] hover:border-[#15677f] hover:text-[#15677f] hover:-translate-y-0.5'
              }`}
            >
              {s.fr}
            </button>
          ))}
        </div>
      )}

      {!activeSubcat && (
        <>
          <SortBar sort={sort} onSort={setSort} waveRef={wavePathSortRef} />
          {list.length === 0 ? (
            <div className="text-center py-16 text-ink/50 text-sm">Pas encore de produits ici.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} autoOpen={String(p.id) === openProductId} />
              ))}
            </div>
          )}
        </>
      )}

      {activeSubcat && (
        <div
          onClick={requestClose}
          className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4 transition-colors duration-300 ${
            visible ? 'bg-ink/60' : 'bg-ink/0'
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative bg-mineral w-full max-w-6xl rounded-2xl shadow-2xl p-6 sm:p-10 mt-4 transition-all duration-300 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
            }`}
          >
            <button
              onClick={requestClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-ink/10 flex items-center justify-center text-ink/60 hover:text-ink hover:border-teal transition"
              aria-label="Fermer"
            >
              ✕
            </button>

            {isAccessoiresView && !activeType ? (
              <>
                <DropletTitle text="Accessoires Osmoseur" size="text-2xl" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {albums.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setActiveType(a.value)}
                      className="group relative text-left bg-white border border-ink/10 rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition"
                    >
                      <div className="relative aspect-square bg-aqua overflow-hidden">
                        {a.coverSrc ? (
                          <img src={a.coverSrc} alt={a.fr} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-25">📦</div>
                        )}
                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/55 transition-colors duration-300 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold text-sm">
                            {a.count} article{a.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="absolute top-2 right-2 bg-white/90 text-ink text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          {a.count}
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-semibold leading-tight">{a.fr}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : isAccessoiresView && activeType ? (
              <>
                <button onClick={() => setActiveType(null)} className="text-sm text-teal font-semibold mb-4 inline-block">
                  ← Tous les albums
                </button>
                <DropletTitle text={activeAlbum?.fr} size="text-2xl" />
                <SortBar sort={sort} onSort={setSort} waveRef={wavePathSortRef} />
                {list.length === 0 ? (
                  <div className="text-center py-16 text-ink/50 text-sm">Pas encore de produits ici.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {list.map((p) => (
                      <ProductCard key={p.id} product={p} autoOpen={String(p.id) === openProductId} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <DropletTitle text={activeSubcatData?.fr} size="text-2xl" />
                {activeSubcatData?.description && (
                  <p className="text-ink font-medium max-w-2xl mx-auto mb-6 text-base leading-relaxed text-center">
                    {activeSubcatData.description}
                  </p>
                )}
                <SortBar sort={sort} onSort={setSort} waveRef={wavePathSortRef} />
                {list.length === 0 ? (
                  <div className="text-center py-16 text-ink/50 text-sm">Pas encore de produits ici.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {list.map((p) => (
                      <ProductCard key={p.id} product={p} autoOpen={String(p.id) === openProductId} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}