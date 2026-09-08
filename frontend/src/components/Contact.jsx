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
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14">
        <div>
          <h2 className="text-3xl font-bold mb-4">{t('contact_title')}</h2>
          <p className="text-ink/65 max-w-md mb-7">{t('contact_sub')}</p>
          <div className="flex items-center gap-3 py-3.5 border-b border-ink/10 text-sm">📞 <b>+216 21 611 214</b></div>

          <a href="https://wa.me/21621611214"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-3.5 border-b border-ink/10 text-sm hover:text-teal transition"
          >
            💬 <b>+216 21 611 214</b> (WhatsApp)
          </a>
          <div className="flex items-center gap-3 py-3.5 border-b border-ink/10 text-sm">📍 <b>Sfax, Tunisie</b></div>
          <div className="flex items-center gap-3 py-3.5 border-b border-ink/10 text-sm">🕐 <b>Lun–Ven 8h–17h</b>, Sam 8h–14h</div>
        </div>
        <div>
          {status === 'done' ? (
            <div className="bg-mineral2 rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-semibold">Message envoyé, merci !</p>
              <p className="text-xs text-ink/60 mt-1">Nous vous répondrons dès que possible.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1.5">{t('form_name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder={t('form_name_ph')}
                  className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1.5">{t('form_phone')}</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+216 ..."
                  className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1.5">{t('form_msg')}</label>
                <textarea
                  rows="4"
                  value={form.message}
                  onChange={update('message')}
                  placeholder={t('form_msg_ph')}
                  className="w-full px-3.5 py-3 border border-ink/15 rounded text-sm"
                />
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-500 mb-3">Une erreur est survenue, réessayez.</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-teal text-white font-semibold rounded hover:bg-tealLight transition disabled:opacity-50"
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