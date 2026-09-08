// backend/routes/contact.js
import express from 'express';
import { pool } from '../lib/db.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

async function sendEmail(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Crystal Water <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Envoi email échoué :', res.status, errText);
    }
  } catch (err) {
    console.error('Envoi email échoué :', err.message);
  }
}

router.post('/', async (req, res) => {
  const { name, phone, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  if (!pool) {
    console.log('Message de contact (mode démo) :', req.body);
    return res.status(200).json({ ok: true, demo: true });
  }

  try {
    await pool.query(
      'insert into contact_messages (name, phone, message) values ($1, $2, $3)',
      [name, phone, message]
    );

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const html = `
        <h2>📩 Nouveau message de contact — Crystal Water</h2>
        <p><b>${name}</b> — ${phone}</p>
        <p style="white-space:pre-wrap;">${message}</p>
      `;
      sendEmail(adminEmail, `Message de contact — ${name}`, html);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'enregistrer le message." });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  if (!pool) return res.json({ messages: [] });

  try {
    const result = await pool.query('select * from contact_messages order by created_at desc');
    res.json({ messages: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/read', requireAdmin, async (req, res) => {
  if (!pool) return res.json({ ok: true, demo: true });

  try {
    await pool.query('update contact_messages set read = true where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;