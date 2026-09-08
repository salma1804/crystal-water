# Crystal Water — projet complet

Structure :
- `frontend/` — React + Vite + Tailwind (le site que voient tes clients)
- `backend/` — Node.js + Express (reçoit les commandes et les enregistre dans Supabase)
- `supabase-schema.sql` — à exécuter une fois dans le SQL Editor de ton projet Supabase

## Comment démarrer (à faire à chaque fois que tu travailles dessus)

### 1. Backend
```
cd backend
npm install
cp .env.example .env
```
Puis ouvre `.env` et remplace SUPABASE_URL et SUPABASE_SERVICE_KEY par tes vraies valeurs
(Settings > API dans ton projet Supabase — attention, ici c'est la clé "service_role", pas "anon").

```
npm run dev
```
Le backend tourne sur http://localhost:4000

### 2. Frontend (dans un DEUXIEME terminal, en gardant le premier ouvert)
```
cd frontend
npm install
cp .env.example .env
npm run dev
```
Le site s'ouvre sur http://localhost:5173

## Pourquoi deux terminaux ?
Le frontend (le site) et le backend (qui reçoit les commandes) sont deux programmes séparés
qui doivent tourner en même temps pendant que tu développes. C'est normal.
