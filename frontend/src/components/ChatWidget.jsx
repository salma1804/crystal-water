import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LangContext.jsx';


export default function ChatWidget() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapRef}>
      <div
        className={`fixed right-6 bottom-24 z-[151] w-[300px] max-w-[85vw] bg-white rounded-lg shadow-2xl overflow-hidden transition-all ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-[#25D366] text-white px-4.5 py-4 text-sm font-semibold">{t('chat_head')}</div>
        <div className="p-4.5">
          <div className="bg-mineral2 rounded p-3 text-sm mb-3.5">{t('chat_greeting')}</div>
          {[
            [t('chat_opt1'), 'Bonjour, je souhaite un devis'],
            [t('chat_opt2'), "Bonjour, j'ai une question sur un produit"],
            [t('chat_opt3'), "Bonjour, j'ai besoin du support technique"],
          ].map(([label, message]) => (
            <a
              key={label}
              href={`https://wa.me/21621611214?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3.5 py-2.5 mb-2 border border-ink/15 rounded text-sm font-medium hover:border-[#25D366] hover:bg-[#25D366]/5 transition"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="fixed right-6 bottom-6 z-[150] flex flex-col gap-3 items-end">
        <a
          href="https://wa.me/21621611214"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }}
          className="w-13 h-13 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:scale-105 transition"
          style={{ width: 52, height: 52 }}
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 32 32" fill="white" width="24" height="24">
            <path d="M16 3C9 3 3 9 3 16c0 2.6.7 5 2 7.1L3 29l6.1-2c2 1.1 4.4 1.8 6.9 1.8 7 0 13-6 13-13S23 3 16 3zm0 23.6c-2.2 0-4.3-.6-6.1-1.7l-.4-.3-4.1 1.3 1.3-4-.3-.4C5.1 19.6 4.4 17.8 4.4 16c0-6.4 5.2-11.6 11.6-11.6S27.6 9.6 27.6 16 22.4 26.6 16 26.6z" />
          </svg>
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61593398301814"
          target="_blank" rel="noopener noreferrer"
          className="rounded-full bg-[#1877F2] shadow-lg flex items-center justify-center hover:scale-105 transition"
          style={{ width: 52, height: 52 }}
          aria-label="Facebook"
        >
          <svg viewBox="0 0 32 32" fill="white" width="24" height="24">
            <path d="M18 32V17h5l1-6h-6v-3.5c0-1.7.5-2.9 3-2.9H24V.3C23.5.2 21.7 0 19.6 0 15.2 0 12 2.7 12 7.6V11H7v6h5v15h6z" />
          </svg>
        </a>
        <a
          
  href="https://mail.google.com/mail/?view=cm&fs=1&to=crystalwater.officiel@gmail.com"
  target="_blank"
  rel="noopener noreferrer"
  className="rounded-full bg-teal shadow-lg flex items-center justify-center hover:scale-105 transition"
  style={{ width: 52, height: 52 }}
  aria-label="Email"
>
          <svg viewBox="0 0 32 32" fill="white" width="24" height="24">
            <path d="M4 6h24a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 3.4V22h24V9.4L16 19 4 9.4zm1.4-1.4L16 16.3 26.6 8H5.4z" />
          </svg>
        </a>
            </div>
    </div>
  );
}