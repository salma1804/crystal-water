import React, { useEffect, useState } from 'react';
import { useLang } from '../context/LangContext.jsx';

function AnimatedStat({ target, suffix, decimal }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    let frame;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(decimal ? (target * eased).toFixed(1) : Math.round(target * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, decimal]);

  return <b className="block font-display text-2xl font-bold text-white">{value}{suffix}</b>;
}

export default function Hero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center text-center text-white overflow-hidden pt-28 pb-16">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay muted loop playsInline
        poster="https://images.pexels.com/videos/27114631/pexels-photo-27114631.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200"
      >
        <source src="https://videos.pexels.com/video-files/27114631/12076824_2560_1440_24fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(180deg, rgba(18,48,71,0.55) 0%, rgba(18,48,71,0.78) 65%, rgba(18,48,71,0.92) 100%)' }} />

      <div className="relative z-[2] max-w-2xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-tealLight mb-5">
          <span className="w-2 h-2 bg-gold facet-badge" />
          {t('hero_eyebrow')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
          {t('hero_title_before')}<em className="not-italic text-tealLight">{t('hero_title_pure')}</em>{t('hero_title_after')}
        </h1>
        <p className="text-base text-white/85 max-w-xl mx-auto mb-9">{t('hero_lead')}</p>

        <div className="flex gap-3 flex-wrap justify-center mb-12">
          <a href="#boutique" className="px-7 py-3.5 rounded bg-teal text-white font-semibold text-sm hover:bg-tealLight transition">
            {t('hero_cta1')}
          </a>
          <a href="#contact" className="px-7 py-3.5 rounded bg-white/10 border border-white/40 text-white font-semibold text-sm hover:bg-white/20 transition">
            {t('hero_cta2')}
          </a>
        </div>

        <div className="flex gap-9 justify-center flex-wrap">
          <div className="text-center">
            <AnimatedStat target={10} suffix="+" />
            <span className="text-xs text-white/75">{t('stat1')}</span>
          </div>
          <div className="text-center">
            <AnimatedStat target={2400} suffix="+" />
            <span className="text-xs text-white/75">{t('stat2')}</span>
          </div>
          <div className="text-center">
            <AnimatedStat target={99.9} suffix="%" decimal />
            <span className="text-xs text-white/75">{t('stat3')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
