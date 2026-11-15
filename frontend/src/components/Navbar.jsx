import React from 'react';
import { useLang } from '../context/LangContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import CartGlassIcon from './CartGlassIcon.jsx';
import SearchBar from './SearchBar.jsx';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const { cart, setIsOpen } = useCart();

  const navLinkClass =
    "relative text-[#33505b] hover:text-[#07222d] transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#15677f] after:rounded-full after:transition-all after:duration-300 hover:after:w-full";

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#d6e3e6] shadow-[0_8px_24px_-20px_rgba(7,34,45,.45)]">
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-4 py-4 px-6">
        <a href="#" className="flex items-center flex-shrink-0">
          <img src={logo} alt="Crystal Water" className="h-14 w-auto" />
        </a>

        <SearchBar className="hidden sm:block flex-1" />

        <ul className="hidden lg:flex gap-8 text-[15px] font-semibold flex-shrink-0">
          <li><a href="#boutique" className={navLinkClass}>{t('nav_shop')}</a></li>
          <li><a href="#categories" className={navLinkClass}>{t('nav_cat')}</a></li>
          <li><a href="#services" className={navLinkClass}>{t('nav_services')}</a></li>
          <li><a href="#contact" className={navLinkClass}>{t('nav_contact')}</a></li>
        </ul>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex bg-[#edf4f5] border border-[#d6e3e6] rounded-full p-0.5 text-xs font-semibold">
            {['fr', 'ar', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-full transition ${lang === l ? 'bg-[#15677f] text-white' : 'text-[#4a6670] hover:text-[#07222d]'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 px-5 py-2.5 bg-[#15677f] text-white rounded-xl text-sm font-semibold hover:bg-[#0c3a4a] transition"
          >
            {t('nav_cart')}
            <span className="absolute -top-2 -right-2 bg-[#2bb7d6] text-[#07222d] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          </button>
        </div>
      </nav>

      <div className="sm:hidden px-6 pb-3">
        <SearchBar className="w-full max-w-none" />
      </div>
    </header>
  );
}