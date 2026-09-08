// backend/routes/reviews.js
import express from 'express';
import { pool } from '../lib/db.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!pool) return res.json({ reviews: [] });

  try {
    const result = await pool.query(
      'select id, customer_name, rating, message, created_at from reviews where approved = true order by created_at desc limit 30'
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { customer_name, rating, message } = req.body;

  if (!customer_name || !rating || !message) {
    return res.status(400).json({ error: 'Nom, note et message sont obligatoires.' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être entre 1 et 5.' });
  }

  if (!pool) return res.status(200).json({ ok: true, demo: true });

  try {
    const result = await pool.query(
      `insert into reviews (customer_name, rating, message) values ($1, $2, $3) returning *`,
      [customer_name, rating, message]
    );
    res.status(201).json({ ok: true, review: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'enregistrer l'avis." });
  }
});

router.get('/all', requireAdmin, async (req, res) => {
  if (!pool) return res.json({ reviews: [] });

  try {
    const result = await pool.query('select * from reviews order by created_at desc');
    res.json({ reviews: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/approve', requireAdmin, async (req, res) => {
  if (!pool) return res.json({ ok: true, demo: true });

  try {
    const result = await pool.query(
      'update reviews set approved = true where id = $1 returning *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Avis introuvable.' });
    res.json({ ok: true, review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  if (!pool) return res.json({ ok: true, demo: true });

  try {
    await pool.query('delete from reviews where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;