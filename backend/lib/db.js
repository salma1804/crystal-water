// backend/lib/db.js
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const isConfigured = connectionString && !connectionString.includes('VOTRE-');

if (!isConfigured) {
  console.warn(
    '⚠️  DATABASE_URL pas encore configurée dans backend/.env (mode démo) — ' +
    'les commandes et rappels seront juste affichés dans le terminal, pas enregistrés.'
  );
}

export const pool = isConfigured
  ? new pg.Pool({
      connectionString,
      // Décommente la ligne suivante si ton hébergeur Postgres exige SSL (Neon, Render, etc.)
      // ssl: { rejectUnauthorized: false },
    })
  : null;