// backend/routes/auth.js
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 h
const MAX_FAILS = 4;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

// ---- MFA (TOTP, compatible Google Authenticator) ----
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Decode(str) {
  const clean = String(str).replace(/[\s=]/g, '').toUpperCase();
  let bits = '';
  for (const c of clean) {
    const v = B32.indexOf(c);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function totp(secretB32, counter) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', base32Decode(secretB32)).update(buf).digest();
  const off = h[h.length - 1] & 0xf;
  const code = (h.readUInt32BE(off) & 0x7fffffff) % 1000000;
  return String(code).padStart(6, '0');
}
export function verifyTotp(secretB32, code, now = Date.now()) {
  const c = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return false;
  const step = Math.floor(now / 1000 / 30);
  for (const d of [-1, 0, 1]) {
    if (safeEqual(totp(secretB32, step + d), c)) return true;
  }
  return false;
}

const secret = () => process.env.TOKEN_SECRET || process.env.ADMIN_PASSWORD || '';

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function issueToken() {
  const exp = Date.now() + TOKEN_TTL_MS;
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = `${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || !secret()) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!safeEqual(sig, sign(`${exp}.${nonce}`))) return false;
  return Number(exp) > Date.now();
}

// Limite de tentatives par IP
const fails = new Map();
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || req.ip || '').toString().split(',')[0].trim();
}
function isBlocked(ip) {
  const e = fails.get(ip);
  if (!e) return false;
  if (Date.now() - e.first > WINDOW_MS) { fails.delete(ip); return false; }
  return e.count >= MAX_FAILS;
}
function recordFail(ip) {
  const e = fails.get(ip);
  if (!e || Date.now() - e.first > WINDOW_MS) fails.set(ip, { count: 1, first: Date.now() });
  else e.count += 1;
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!verifyToken(token)) return res.status(401).json({ error: 'Non autorisé.' });
  next();
}

router.post('/login', (req, res) => {
  const ip = clientIp(req);
  if (isBlocked(ip)) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  }
  const expected = process.env.ADMIN_PASSWORD;
  const { password, code } = req.body || {};
  if (!expected || !password || !safeEqual(password, expected)) {
    recordFail(ip);
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }
  const mfaSecret = process.env.MFA_SECRET;
  if (mfaSecret) {
    if (!code) {
      return res.status(401).json({ error: 'Code de vérification requis.', mfaRequired: true });
    }
    if (!verifyTotp(mfaSecret, code)) {
      recordFail(ip);
      return res.status(401).json({ error: 'Code de vérification incorrect.', mfaRequired: true });
    }
  }
  fails.delete(ip);
  res.json({ ok: true, token: issueToken() });
});

router.post('/logout', (req, res) => res.json({ ok: true }));

router.get('/check', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const v = verifyToken(token);
  res.json({ ok: v, valid: v });
});

export default router;