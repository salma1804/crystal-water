// backend/routes/reminders.js
import express from 'express';
import { pool } from '../lib/db.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { phone, product_name, cat, interval_months } = req.body;

  if (!phone || !product_name || !interval_months) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (téléphone, produit, intervalle).' });
  }

  const remindAt = new Date();
  remindAt.setMonth(remindAt.getMonth() + Number(interval_months));

  if (!pool) {
    console.log('Rappel enregistré (mode démo) :', { phone, product_name, cat, interval_months, remindAt });
    return res.status(200).json({ ok: true, demo: true });
  }

  try {
    const result = await pool.query(
      `insert into reminders (phone, product_name, cat, interval_months, remind_at, sent)
       values ($1, $2, $3, $4, $5, false)
       returning *`,
      [phone, product_name, cat, interval_months, remindAt.toISOString()]
    );
    res.status(201).json({ ok: true, reminder: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'enregistrer le rappel." });
  }
});

router.get('/due', requireAdmin, async (req, res) => {
  if (!pool) return res.status(200).json({ reminders: [] });

  try {
    const result = await pool.query(
      `select * from reminders where sent = false and remind_at <= now() order by remind_at asc`
    );
    res.json({ reminders: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/sent', requireAdmin, async (req, res) => {
  if (!pool) return res.status(200).json({ ok: true, demo: true });

  try {
    await pool.query('update reminders set sent = true where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;