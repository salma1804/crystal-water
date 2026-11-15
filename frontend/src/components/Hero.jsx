import React, { useEffect, useState } from 'react';
import { useLang } from '../context/LangContext.jsx';

function AnimatedStat({ target, suffix, decimal }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1600;
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

  return (
    <b className="block font-display text-4xl font-bold text-white leading-none">
      {value}{suffix}
    </b>
  );
}

const bubbles = [
  { left: '6%', size: 10, dur: 11, delay: 0 },
  { left: '14%', size: 18, dur: 15, delay: -6 },
  { left: '26%', size: 8, dur: 9, delay: -3 },
  { left: '38%', size: 14, dur: 13, delay: -9 },
  { left: '52%', size: 9, dur: 10, delay: -5 },
  { left: '63%', size: 20, dur: 16, delay: -2 },
  { left: '74%', size: 11, dur: 12, delay: -8 },
  { left: '86%', size: 15, dur: 14, delay: -4 },
  { left: '94%', size: 8, dur: 9, delay: -7 },
];

const css = `
@keyframes cwHeroBub{0%{transform:translateY(0) scale(.8);opacity:0}12%{opacity:.7}100%{transform:translateY(-105vh) scale(1.15);opacity:0}}
.cw-hero-bub{position:absolute;bottom:-30px;border-radius:50%;background:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.55);animation:cwHeroBub linear infinite;pointer-events:none}
@keyframes cwHeroGlow{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(6%,8%) scale(1.12)}}
.cw-hero-glow{animation:cwHeroGlow 14s ease-in-out infinite}
@keyframes cwHeroWave{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.cw-hero-wave{animation:cwHeroWave 26s linear infinite}
@keyframes cwHeroIn{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.cw-hero-in{animation:cwHeroIn .9s cubic-bezier(.2,.7,.3,1) both}
@media (prefers-reduced-motion:reduce){.cw-hero-bub,.cw-hero-glow,.cw-hero-wave,.cw-hero-in{animation:none}}
`;

export default function Hero() {
  const { t } = useLang();
  const [videoOk, setVideoOk] = useState(true);

  return (
    <section className="relative min-h-[92vh] flex items-center text-white overflow-hidden pt-28 pb-32">
      <style>{css}</style>

      {/* fond de secours animé : jamais une simple bande bleue */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(150deg,#07222d 0%,#0c3a4a 45%,#15677f 100%)' }}
      />
      <div
        className="cw-hero-glow absolute z-0 -top-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(43,183,214,.45),rgba(43,183,214,0) 65%)' }}
      />

      {videoOk && (
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
          autoPlay muted loop playsInline
          onError={() => setVideoOk(false)}
          poster="https://images.pexels.com/videos/27114631/pexels-photo-27114631.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200"
        >
          <source
            src="https://videos.pexels.com/video-files/27114631/12076824_2560_1440_24fps.mp4"
            type="video/mp4"
            onError={() => setVideoOk(false)}
          />
        </video>
      )}

      {/* voile : plus sombre à gauche pour le texte, vidéo visible à droite */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(95deg, rgba(7,34,45,0.92) 0%, rgba(7,34,45,0.7) 45%, rgba(7,34,45,0.15) 100%)' }}
      />

      {bubbles.map((b, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="cw-hero-bub z-[1]"
          style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        />
      ))}

      <div className="relative z-[2] w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.35fr_1fr] gap-12 items-center">
        <div>
          <div className="cw-hero-in inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur rounded-full px-4 py-2 text-sm font-medium text-[#bfeaf5] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#2bb7d6]" />
            {t('hero_eyebrow')}
          </div>
          <h1 className="cw-hero-in text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight mb-6" style={{ animationDelay: '.1s' }}>
            {t('hero_title_before')}<em className="not-italic text-tealLight">{t('hero_title_pure')}</em>{t('hero_title_after')}
          </h1>
          <p className="cw-hero-in text-lg text-white/85 max-w-xl mb-9 leading-relaxed" style={{ animationDelay: '.2s' }}>
            {t('hero_lead')}
          </p>

          <div className="cw-hero-in flex gap-3 flex-wrap" style={{ animationDelay: '.3s' }}>
            <a href="#boutique" className="px-8 py-4 rounded-xl bg-[#2bb7d6] text-[#07222d] font-bold text-base hover:bg-[#5fcbe3] transition shadow-lg shadow-[#2bb7d6]/30">
              {t('hero_cta1')}
            </a>
            <a href="#contact" className="px-8 py-4 rounded-xl bg-white/10 border border-white/40 backdrop-blur text-white font-semibold text-base hover:bg-white/20 transition">
              {t('hero_cta2')}
            </a>
          </div>
        </div>

        <div className="cw-hero-in grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4" style={{ animationDelay: '.4s' }}>
          {[
            { target: 10, suffix: '+', key: 'stat1' },
            { target: 2400, suffix: '+', key: 'stat2' },
            { target: 99.9, suffix: '%', key: 'stat3', decimal: true },
          ].map((s) => (
            <div key={s.key} className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-4 py-4 lg:px-6 lg:py-5">
              <AnimatedStat target={s.target} suffix={s.suffix} decimal={s.decimal} />
              <span className="block mt-1.5 text-xs lg:text-sm text-white/75">{t(s.key)}</span>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="absolute left-0 right-0 bottom-0 h-24 overflow-hidden z-[3]">
        <svg className="cw-hero-wave block" width="200%" height="96" viewBox="0 0 2400 96" preserveAspectRatio="none">
          <path d="M0 48 C 150 12 300 84 450 48 S 750 12 900 48 S 1200 84 1200 48 C 1350 12 1500 84 1650 48 S 1950 12 2100 48 S 2400 84 2400 48 V96 H0Z" fill="#F4F9FC" />
        </svg>
      </div>
    </section>
  );
}
