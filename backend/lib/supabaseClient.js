import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const isConfigured =
  supabaseUrl && supabaseKey && !supabaseUrl.includes('VOTRE-PROJET') && !supabaseKey.includes('VOTRE-CLE');

if (!isConfigured) {
  console.warn(
    '⚠️  Supabase pas encore configuré dans backend/.env (mode démo) — ' +
    'les commandes seront juste affichées dans le terminal, pas enregistrées.'
  );
}

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null;
