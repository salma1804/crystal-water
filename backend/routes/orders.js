// backend/routes/orders.js
import express from 'express';
import crypto from 'crypto';
import { pool } from '../lib/db.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

function generateOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CW-';
  for (let i = 0; i < 6; i++) code += chars[crypto.randomInt(chars.length)];
  return code;
}

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

async function notifyAdminWhatsApp(order) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return;

  const itemsList = (order.items || []).map((i) => `- ${i.name}`).join('\n');
  const message =
    `🔔 Nouvelle commande !\n` +
    `${order.customer_name} — ${order.phone}\n` +
    `${order.address}${order.city ? ', ' + order.city : ''}\n` +
    `${itemsList}\n` +
    `Total : ${order.total} د.ت`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apikey}`;

  try {
    await fetch(url);
  } catch (err) {
    console.error('Notification WhatsApp admin échouée :', err.message);
  }
}

function notifyAdminEmail(order) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const itemsHtml = (order.items || [])
    .map((i) => `<li>${i.name} — ${i.price} د.ت</li>`)
    .join('');

  const html = `
    <h2>🔔 Nouvelle commande — Crystal Water</h2>
    <p><b>${order.customer_name}</b> — ${order.phone}</p>
    <p>${order.address}${order.city ? ', ' + order.city : ''}</p>
    <ul>${itemsHtml}</ul>
    <p><b>Total : ${order.total} د.ت</b></p>
  `;

  sendEmail(adminEmail, `Nouvelle commande — ${order.customer_name} (${order.total} د.ت)`, html);
}

function sendCustomerConfirmationEmail(order) {
  if (!order.customer_email) return;

  const itemsHtml = (order.items || [])
    .map((i) => `<li>${i.name} — ${i.price} د.ت</li>`)
    .join('');

  const html = `
    <h2>✅ Merci pour votre commande, ${order.customer_name} !</h2>
    <p>Votre commande a bien été enregistrée. Voici un récapitulatif :</p>
    <ul>${itemsHtml}</ul>
    <p><b>Total : ${order.total} د.ت</b></p>
    <p>Paiement à la livraison.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
    <p>🔑 Votre <b>code de suivi</b>, à conserver pour retrouver votre commande à tout moment :</p>
    <p style="font-size:22px;font-weight:bold;letter-spacing:2px;color:#2E93C4;">${order.order_code}</p>
    <p style="color:#888;font-size:13px;">Gardez cet email — il vous permettra de retrouver votre commande même dans plusieurs mois, sur n'importe quel appareil.</p>
  `;

  sendEmail(order.customer_email, `Votre commande Crystal Water — code ${order.order_code}`, html);
}

router.post('/', async (req, res) => {
  const { customer_name, phone, address, city, items, total, email, latitude, longitude, location_label } = req.body;

  if (!customer_name || !phone || !address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (nom, téléphone, adresse, produits).' });
  }

  if (!pool) {
    console.log('Commande reçue (mode démo) :', req.body);
    return res.status(200).json({ ok: true, demo: true });
  }

  try {
    let orderCode;
    let result;
    for (let attempt = 0; attempt < 5; attempt++) {
      orderCode = generateOrderCode();
      try {
        result = await pool.query(
          `insert into orders (customer_name, phone, address, city, items, total, order_code, customer_email, latitude, longitude, location_label)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           returning *`,
          [customer_name, phone, address, city, JSON.stringify(items), total, orderCode, email || null, latitude ?? null, longitude ?? null, location_label || null]
        );
        break;
      } catch (err) {
        if (err.code === '23505') continue;
        throw err;
      }
    }

    if (!result) throw new Error('Impossible de générer un code de commande unique.');

    const order = result.rows[0];

    notifyAdminWhatsApp(order);
    notifyAdminEmail(order);
    sendCustomerConfirmationEmail(order);

    res.status(201).json({ ok: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'enregistrer la commande." });
  }
});

router.get('/track', async (req, res) => {
  const { phone, code } = req.query;

  if (!phone || !code) {
    return res.status(400).json({ error: 'Téléphone et code de commande requis.' });
  }

  if (!pool) return res.json({ order: null });

  const cleanPhone = phone.replace(/[\s\-\.]/g, '');

  try {
    const result = await pool.query(
      `select id, customer_name, phone, address, city, items, total, delivered, created_at, order_code
       from orders
       where regexp_replace(phone, '[\\s\\-\\.]', '', 'g') = $1
       and upper(order_code) = upper($2)`,
      [cleanPhone, code.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune commande trouvée avec ces informations.' });
    }

    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Impossible de récupérer la commande.' });
  }
});

router.post('/resend-code', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Téléphone requis.' });

  if (!pool) return res.status(404).json({ error: 'Aucune commande trouvée.' });

  const cleanPhone = phone.replace(/[\s\-\.]/g, '');

  try {
    const result = await pool.query(
      `select order_code, customer_email, customer_name
       from orders
       where regexp_replace(phone, '[\\s\\-\\.]', '', 'g') = $1
       order by created_at desc
       limit 1`,
      [cleanPhone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune commande trouvée avec ce numéro.' });
    }

    const { order_code, customer_email, customer_name } = result.rows[0];

    if (!customer_email) {
      return res.status(400).json({
        error: "Aucun email n'était associé à cette commande. Contactez-nous directement sur WhatsApp pour retrouver votre commande.",
      });
    }

    const html = `
      <h2>🔑 Votre code de suivi Crystal Water</h2>
      <p>Bonjour ${customer_name},</p>
      <p>Voici votre code de suivi de commande :</p>
      <p style="font-size:22px;font-weight:bold;letter-spacing:2px;color:#2E93C4;">${order_code}</p>
    `;
    await sendEmail(customer_email, 'Votre code de suivi Crystal Water', html);

    const maskedEmail = customer_email.replace(/(.{2}).+(@.+)/, '$1***$2');
    res.json({ ok: true, message: `Un email a été envoyé à ${maskedEmail}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Une erreur est survenue.' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  if (!pool) return res.status(200).json({ orders: [] });

  try {
    const result = await pool.query('select * from orders order by created_at desc');
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/delivered', requireAdmin, async (req, res) => {
  const { delivered } = req.body;

  if (!pool) return res.status(200).json({ ok: true, demo: true });

  try {
    const result = await pool.query(
      'update orders set delivered = $1 where id = $2 returning *',
      [delivered !== false, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Commande introuvable.' });
    res.json({ ok: true, order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de mettre à jour la commande." });
  }
});

export default router;