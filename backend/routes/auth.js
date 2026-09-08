// backend/routes/auth.js
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const activeTokens = new Set();

router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.includes('VOTRE-')) {
    return res.status(500).json({ error: "Mot de passe admin pas encore configuré côté serveur." });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.add(token);
  res.json({ ok: true, token });
});

router.post('/logout', (req, res) => {
  const { token } = req.body;
  activeTokens.delete(token);
  res.json({ ok: true });
});

router.get('/check', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  res.json({ valid: activeTokens.has(token) });
});

export function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: 'Non autorisé.' });
  }
  next();
}

export default router;