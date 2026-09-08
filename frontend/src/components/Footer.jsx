import React from 'react';
import { useLang } from '../context/LangContext.jsx';
import logo from '../assets/logo.png';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-ink text-white/60 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between flex-wrap gap-8 pb-7 border-b border-white/10 mb-6">
          <img src={logo} alt="Crystal Water" className="h-10 w-auto" />
          <div className="max-w-xs text-sm">{t('footer_tagline')}</div>
        </div>
        <div className="flex justify-between flex-wrap gap-2.5 text-xs">
          <span>{t('footer_copy')}</span>
          <span>Maquette React — connectée au backend Crystal Water</span>
        </div>
      </div>
    </footer>
  );
}
