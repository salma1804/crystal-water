import React from 'react';
import { useLang } from '../context/LangContext.jsx';

const items = {
  fr: [
    ['Paiement à la livraison', 'Vous payez quand vous recevez'],
    ['Livraison partout', 'Dans toute la Tunisie'],
    ['Diagnostic gratuit', 'On analyse votre eau avec vous'],
    ['Rappel de cartouches', 'On vous prévient avant le remplacement'],
  ],
  en: [
    ['Cash on delivery', 'Pay when you receive'],
    ['Delivery everywhere', 'Across all of Tunisia'],
    ['Free diagnosis', 'We analyse your water with you'],
    ['Cartridge reminders', 'We warn you before replacement'],
  ],
  ar: [
    ['الدفع عند الاستلام', 'تدفع عند وصول الطلب'],
    ['توصيل لكل مكان', 'في كامل تونس'],
    ['تشخيص مجاني', 'نحلل مياهك معك'],
    ['تذكير بالخراطيش', 'ننبهك قبل موعد التغيير'],
  ],
};

const icons = [
  <path key="a" d="M2 7h20v11H2zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />,
  <path key="b" d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.8 1.8 0 1 0 0-.01M17 19a1.8 1.8 0 1 0 0-.01" />,
  <path key="c" d="M12 3C12 3 5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z" />,
  <path key="d" d="M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />,
];

export default function Trust() {
  const { lang } = useLang();
  const list = items[lang] || items.fr;
  return (
    <section className="relative z-[4] mt-14 pb-10">
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-6">
        {list.map(([title, sub], i) => (
          <div key={title} className="basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(25%-18px)] bg-white border border-[#d6e3e6] rounded-3xl p-6 flex flex-col gap-4 items-start shadow-[0_20px_40px_-26px_rgba(7,34,45,.5)] transition hover:-translate-y-1 hover:border-[#2bb7d6]">
            <span className="w-14 h-14 rounded-2xl bg-[#e3f1f4] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15677f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[i]}</svg>
            </span>
            <div>
              <div className="font-display text-lg font-bold leading-tight text-[#07222d]">{title}</div>
              <div className="text-[15px] text-[#4a6670] mt-1.5 leading-snug">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}