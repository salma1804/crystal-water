import React, { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
      setForm({ name: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#07222d] mb-3">{t('contact_title')}</h2>
          <div className="w-14 h-1 rounded-full bg-[#15677f] mb-3" />
          <p className="text-[#4a6670] text-base leading-relaxed max-w-md mb-8">{t('contact_sub')}</p>

          <div className="space-y-3 max-w-md">
            <a href="tel:+21621611214" className="flex items-center gap-4 bg-white border border-[#d6e3e6] rounded-2xl px-4 py-3.5 text-[15px] text-[#33505b] hover:border-[#15677f] transition">
              <span className="w-11 h-11 rounded-xl bg-[#15677f]/10 flex items-center justify-center flex-shrink-0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15677f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg></span>
              <b className="text-[#07222d]">+216 21 611 214</b>
            </a>
            <a
              href="https://wa.me/21621611214"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white border border-[#d6e3e6] rounded-2xl px-4 py-3.5 text-[15px] text-[#33505b] hover:border-[#15677f] transition"
            >
              <span className="w-11 h-11 rounded-xl bg-[#15677f]/10 flex items-center justify-center flex-shrink-0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15677f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg></span>
              <span><b className="text-[#07222d]">+216 21 611 214</b> (WhatsApp)</span>
            </a>
            <div className="flex items-center gap-4 bg-white border border-[#d6e3e6] rounded-2xl px-4 py-3.5 text-[15px] text-[#33505b]">
              <span className="w-11 h-11 rounded-xl bg-[#15677f]/10 flex items-center justify-center flex-shrink-0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15677f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg></span>
              <b className="text-[#07222d]">Sfax, Tunisie</b>
            </div>
            <div className="flex items-center gap-4 bg-white border border-[#d6e3e6] rounded-2xl px-4 py-3.5 text-[15px] text-[#33505b]">
              <span className="w-11 h-11 rounded-xl bg-[#15677f]/10 flex items-center justify-center flex-shrink-0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15677f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span>
              <span><b className="text-[#07222d]">Lun–Ven 8h–17h</b>, Sam 8h–14h</span>
            </div>
          </div>
        </div>

        <div>
          {status === 'done' ? (
            <div className="bg-white border border-[#d6e3e6] rounded-3xl p-10 text-center shadow-[0_24px_50px_-30px_rgba(7,34,45,.45)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2c9a6a] text-white flex items-center justify-center text-3xl">✓</div>
              <p className="font-display text-xl font-bold text-[#07222d]">Message envoyé, merci !</p>
              <p className="text-[#4a6670] mt-1">Nous vous répondrons dès que possible.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white border border-[#d6e3e6] rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_-30px_rgba(7,34,45,.45)]">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#07222d] mb-1.5">{t('form_name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder={t('form_name_ph')}
                  className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#07222d] mb-1.5">{t('form_phone')}</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+216 ..."
                  className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#07222d] mb-1.5">{t('form_msg')}</label>
                <textarea
                  rows="4"
                  value={form.message}
                  onChange={update('message')}
                  placeholder={t('form_msg_ph')}
                  className="w-full px-4 py-3 bg-white border-[1.5px] border-[#d6e3e6] rounded-xl text-[15px] text-[#0e2a35] placeholder:text-[#8aa0a8] outline-none focus:border-[#15677f] focus:ring-4 focus:ring-[#2bb7d6]/20 transition resize-none"
                />
              </div>
              {status === 'error' && (
                <p className="bg-[#fdecea] text-[#a8321f] text-sm font-medium rounded-xl px-4 py-3 mb-4">Une erreur est survenue, réessayez.</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-[#15677f] text-white text-base font-semibold rounded-xl hover:bg-[#0c3a4a] transition disabled:opacity-50"
              >
                {status === 'loading' ? '...' : t('form_submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}