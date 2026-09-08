import { createClient } from '@supabase/supabase-js';

// Ces deux valeurs viennent du fichier .env (jamais écrites en dur ici).
// Voir .env.example à la racine de frontend/ pour savoir quoi y mettre.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
