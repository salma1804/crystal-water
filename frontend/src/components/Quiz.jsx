import React, { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { categories } from '../i18n/translations.js';

const resultCopy = {
  fr: {
    "adoucisseurs": "Un adoucisseur va éliminer le calcaire à la source et protéger vos canalisations et appareils.",
    "osmoseurs": "Un osmoseur élimine le goût et les odeurs pour une eau parfaitement neutre au robinet.",
    "cartouches-filtrantes": "Une solution simple et économique pour améliorer le goût de votre eau au quotidien.",
    "sterilisateurs-uv": "Un stérilisateur UV élimine bactéries et micro-organismes sans produit chimique."
  },
  en: {
    "adoucisseurs": "A softener removes limescale at the source and protects your pipes and appliances.",
    "osmoseurs": "A reverse osmosis system removes taste and odor for perfectly neutral tap water.",
    "cartouches-filtrantes": "A simple, affordable way to improve your water's everyday taste.",
    "sterilisateurs-uv": "A UV sterilizer eliminates bacteria and micro-organisms with no chemicals."
  },
  ar: {
    "adoucisseurs": "يزيل المكيف الترسبات الكلسية من المصدر ويحمي أنابيبك وأجهزتك.",
    "osmoseurs": "يزيل نظام التناضح العكسي الطعم والرائحة لمياه محايدة تمامًا من الصنبور.",
    "cartouches-filtrantes": "حل بسيط واقتصادي لتحسين طعم مياهك يوميًا.",
    "sterilisateurs-uv": "يقضي معقم الأشعة فوق البنفسجية على البكتيريا والكائنات الدقيقة دون مواد كيميائية."
  }
};

export default function Quiz({ onRecommend }) {
  const { t, lang } = useLang();
  const [answers, setAnswers] = useState({});

  const select = (question, value) => setAnswers((prev) => ({ ...prev, [question]: value }));

  let result = null;
  if (answers.usage && answers.probleme && answers.budget) {
    let catValue;
    if (answers.probleme === 'calcaire') catValue = 'adoucisseurs';
    else if (answers.probleme === 'bacteries') catValue = 'sterilisateurs-uv';
    else catValue = answers.budget === 'petit' ? 'cartouches-filtrantes' : 'osmoseurs';

    const catObj = categories.find((c) => c.value === catValue);
    result = {
      value: catValue,
      label: catObj ? catObj[lang] || catObj.fr : catValue,
      text: (resultCopy[lang] && resultCopy[lang][catValue]) || resultCopy.fr[catValue]
    };
  }

  const OptionGroup = ({ question, options }) => (
  <div className="flex gap-3 flex-wrap">
    {options.map(([value, label]) => {
      const selected = answers[question] === value;
      return (
        <button
          key={value}
          onClick={() => select(question, value)}
          className={`quiz-opt px-6 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
            selected ? 'selected border-teal shadow-lg' : 'border-ink/15 hover:border-teal hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <span className="quiz-fill">
            <span className="quiz-wave" />
          </span>
          <span className={`quiz-label ${selected ? 'text-white' : 'text-ink'}`}>
            {selected && '✓ '}
            {label}
          </span>
        </button>
      );
    })}
  </div>
);

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-11 reveal">
          <h2 className="text-3xl font-bold mb-1">{t('quiz_title')}</h2>
          <p className="text-ink/60 text-sm">{t('quiz_sub')}</p>
        </div>
        <div className="bg-white border-2 border-teal rounded-lg p-8 max-w-2xl mx-auto reveal">
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">{t('quiz_q1')}</p>
            <OptionGroup question="usage" options={[['maison', t('quiz_q1_a')], ['industrie', t('quiz_q1_b')]]} />
          </div>
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">{t('quiz_q2')}</p>
            <OptionGroup question="probleme" options={[['calcaire', t('quiz_q2_a')], ['gout', t('quiz_q2_b')], ['bacteries', t('quiz_q2_c')]]} />
          </div>
          <div className="mb-2">
            <p className="font-semibold text-sm mb-3">{t('quiz_q3')}</p>
            <OptionGroup question="budget" options={[['petit', t('quiz_q3_a')], ['moyen', t('quiz_q3_b')], ['grand', t('quiz_q3_c')]]} />
          </div>

          {result && (
            <div className="mt-6 pt-6 border-t border-ink/10">
              <h4 className="text-lg font-semibold mb-2">
                {lang === 'ar' ? `موصى به لك: ${result.label}` : lang === 'en' ? `Recommended for you: ${result.label}` : `Recommandé pour vous : ${result.label}`}
              </h4>
              <p className="text-sm text-ink/65 mb-4">{result.text}</p>
              <button
                onClick={() => onRecommend(result.value)}
                className="px-7 py-3 rounded bg-teal text-white font-semibold text-sm hover:bg-tealLight transition"
              >
                {t('quiz_cta')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
