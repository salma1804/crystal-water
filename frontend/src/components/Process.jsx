import React from 'react';
import { useLang } from '../context/LangContext.jsx';

const steps = [
  { num: '01', tKey: 'proc1' },
  { num: '02', tKey: 'proc2' },
  { num: '03', tKey: 'proc3' },
  { num: '04', tKey: 'proc4' },
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
  }
};

export default function Process() {
  const { t, lang } = useLang();
  const texts = stepText[lang] || stepText.fr;

  return (
    <section id="services" className="py-20 bg-tealDeep text-mineral">
      <div className="max-w-6xl mx-auto px-6 mb-11 reveal">
        <h2 className="text-3xl font-bold mb-1 text-mineral">
          {lang === 'ar' ? 'كيف تسير العملية' : lang === 'en' ? 'How it works' : 'Comment ça se passe'}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
        {steps.map((s) => (
          <div key={s.num} className="bg-tealDeep p-8">
            <div className="font-mono text-xs text-goldLight mb-3">{s.num}</div>
            <h3 className="text-lg font-semibold mb-2">{texts[s.tKey][0]}</h3>
            <p className="text-sm text-white/65">{texts[s.tKey][1]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
