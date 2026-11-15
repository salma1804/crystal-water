import React from 'react';
import { useLang } from '../context/LangContext.jsx';

const steps = [
  { num: 1, tKey: 'proc1' },
  { num: 2, tKey: 'proc2' },
  { num: 3, tKey: 'proc3' },
  { num: 4, tKey: 'proc4' },
];

const stepText = {
  fr: {
    proc1: ['Diagnostic', 'Analyse gratuite de la qualité de votre eau, chez vous ou sur site industriel.'],
    proc2: ['Installation', 'Pose par nos techniciens, adaptée à vos contraintes techniques.'],
    proc3: ['Mise en service', 'Réglage précis de chaque paramètre pour une performance optimale.'],
    proc4: ['Suivi', 'Contrôles périodiques pour prolonger la durée de vie de votre installation.'],
  },
  en: {
    proc1: ['Diagnosis', 'Free water quality analysis, at your home or industrial site.'],
    proc2: ['Installation', 'Fitted by our technicians, adapted to your technical constraints.'],
    proc3: ['Commissioning', 'Precise tuning of every parameter for optimal performance.'],
    proc4: ['Follow-up', 'Periodic checks to extend the life of your installation.'],
  },
  ar: {
    proc1: ['تشخيص', 'تحليل مجاني لجودة مياهك، في منزلك أو في الموقع الصناعي.'],
    proc2: ['تركيب', 'تركيب من طرف فنيينا، حسب قيودك التقنية.'],
    proc3: ['تشغيل', 'ضبط دقيق لكل معيار لأداء أمثل.'],
    proc4: ['متابعة', 'فحوصات دورية لإطالة عمر تركيبك.'],
  },
};

export default function Process() {
  const { lang } = useLang();
  const texts = stepText[lang] || stepText.fr;

  return (
    <section
      id="services"
      className="relative py-24 text-white overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#07222d 0%,#0c3a4a 60%,#15677f 140%)' }}
    >
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(43,183,214,.28),rgba(43,183,214,0) 65%)' }}
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          {lang === 'ar' ? 'كيف تسير العملية' : lang === 'en' ? 'How it works' : 'Comment ça se passe'}
        </h2>
        <div className="w-14 h-1 rounded-full bg-[#2bb7d6] mb-3" />
        <p className="text-white/75 text-base leading-relaxed mb-12 max-w-xl">
          {lang === 'ar' ? 'من التشخيص إلى المتابعة، أربع خطوات بسيطة.' : lang === 'en' ? 'From diagnosis to follow-up, four simple steps.' : 'Du diagnostic au suivi, quatre étapes simples.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {steps.map((s) => (
            <div
              key={s.num}
              className="relative bg-white/[0.06] border border-white/15 backdrop-blur rounded-3xl p-7 transition hover:bg-white/10 hover:-translate-y-1"
            >
              <div className="w-11 h-11 rounded-full bg-[#2bb7d6] text-[#07222d] font-display font-bold text-lg flex items-center justify-center mb-5">
                {s.num}
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{texts[s.tKey][0]}</h3>
              <p className="text-sm text-white/75 leading-relaxed">{texts[s.tKey][1]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
