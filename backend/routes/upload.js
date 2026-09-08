// backend/routes/upload.js
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from './auth.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Seules les images sont acceptées.'));
    cb(null, true);
  },
});

router.post('/', requireAdmin, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

  try {
    const filename = `${Date.now()}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    res.json({ ok: true, path: `/uploads/products/${filename}` });
  } catch (err) {
    console.error('Erreur de compression image :', err);
    res.status(500).json({ error: "Impossible de traiter l'image." });
  }
});

export default router;