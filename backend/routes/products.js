// backend/routes/products.js
import express from 'express';
import { pool } from '../lib/db.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

// GET /api/products/overrides — PUBLIC : le site l'appelle pour tout le monde afin d'afficher les prix/stock à jour
router.get('/overrides', async (req, res) => {
  if (!pool) return res.json({ overrides: [], custom: [] });

  try {
    const overridesResult = await pool.query('select * from product_overrides');
    const customResult = await pool.query('select * from custom_products order by created_at desc');
    res.json({ overrides: overridesResult.rows, custom: customResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tout ce qui suit MODIFIE des données — réservé à l'admin connecté
router.put('/overrides/:productId', requireAdmin, async (req, res) => {
  const { productId } = req.params;
  const { price, old_price, discount, in_stock } = req.body;

  if (!pool) {
    console.log('Override enregistré (mode démo) :', productId, req.body);
    return res.json({ ok: true, demo: true });
  }

  try {
    const result = await pool.query(
      `insert into product_overrides (product_id, price, old_price, discount, in_stock, updated_at)
       values ($1, $2, $3, $4, $5, now())
       on conflict (product_id)
       do update set price = $2, old_price = $3, discount = $4, in_stock = $5, updated_at = now()
       returning *`,
      [productId, price ?? null, old_price ?? null, discount ?? null, in_stock ?? true]
    );
    res.json({ ok: true, override: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'enregistrer la modification." });
  }
});

router.delete('/overrides/:productId', requireAdmin, async (req, res) => {
  if (!pool) return res.json({ ok: true, demo: true });

  try {
    await pool.query('delete from product_overrides where product_id = $1', [req.params.productId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/custom', requireAdmin, async (req, res) => {
  const {
    name, cat, subcat, description, image, has_real_photo,
    price, old_price, discount, in_stock, specs,
  } = req.body;

  if (!name || !cat || price == null) {
    return res.status(400).json({ error: 'Nom, catégorie et prix sont obligatoires.' });
  }

  if (!pool) {
    console.log('Produit créé (mode démo) :', req.body);
    return res.json({ ok: true, demo: true });
  }

  try {
    const result = await pool.query(
      `insert into custom_products
        (name, cat, subcat, description, image, has_real_photo, price, old_price, discount, in_stock, specs)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       returning *`,
      [
        name, cat, subcat || null, description || '', image || '', has_real_photo || false,
        price, old_price || price, discount || 0, in_stock !== false, JSON.stringify(specs || []),
      ]
    );
    res.status(201).json({ ok: true, product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de créer le produit." });
  }
});

router.put('/custom/:id', requireAdmin, async (req, res) => {
  const {
    name, cat, subcat, description, image, has_real_photo,
    price, old_price, discount, in_stock, specs,
  } = req.body;

  if (!pool) return res.json({ ok: true, demo: true });

  try {
    const result = await pool.query(
      `update custom_products set
        name = $1, cat = $2, subcat = $3, description = $4, image = $5, has_real_photo = $6,
        price = $7, old_price = $8, discount = $9, in_stock = $10, specs = $11
       where id = $12
       returning *`,
      [
        name, cat, subcat || null, description || '', image || '', has_real_photo || false,
        price, old_price || price, discount || 0, in_stock !== false, JSON.stringify(specs || []),
        req.params.id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produit introuvable.' });
    res.json({ ok: true, product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Impossible de modifier le produit.' });
  }
});

router.delete('/custom/:id', requireAdmin, async (req, res) => {
  if (!pool) return res.json({ ok: true, demo: true });

  try {
    await pool.query('delete from custom_products where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;