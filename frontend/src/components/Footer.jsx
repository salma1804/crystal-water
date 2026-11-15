import React from 'react';
import { useLang } from '../context/LangContext.jsx';
import logo from '../assets/logo.png';

const links = {
  fr: { shop: 'Boutique', cats: 'Catégories', how: 'Comment ça se passe', contact: 'Contact', nav: 'Navigation' },
  en: { shop: 'Shop', cats: 'Categories', how: 'How it works', contact: 'Contact', nav: 'Navigation' },
  ar: { shop: 'المتجر', cats: 'الفئات', how: 'كيف تسير العملية', contact: 'اتصل بنا', nav: 'التنقل' },
};

export default function Footer() {
  const { t, lang } = useLang();
  const l = links[lang] || links.fr;

  return (
    <footer className="bg-[#07222d] text-white/70 pt-16 pb-7">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between flex-wrap gap-10 pb-10 border-b border-white/10 mb-6">
          <div className="max-w-sm">
            <img src={logo} alt="Crystal Water" className="h-11 w-auto mb-4" />
            <p className="text-sm leading-relaxed">{t('footer_tagline')}</p>
          </div>
          <div>
            <div className="font-display font-bold text-white mb-4">{l.nav}</div>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#boutique" className="hover:text-[#2bb7d6] transition">{l.shop}</a></li>
              <li><a href="#categories" className="hover:text-[#2bb7d6] transition">{l.cats}</a></li>
              <li><a href="#services" className="hover:text-[#2bb7d6] transition">{l.how}</a></li>
              <li><a href="#contact" className="hover:text-[#2bb7d6] transition">{l.contact}</a></li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-white/50">{t('footer_copy')}</div>
      </div>
    </footer>
  );
}
