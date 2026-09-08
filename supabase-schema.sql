-- Table des commandes Crystal Water
create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text,
  items jsonb not null,
  total numeric not null,
  status text default 'nouvelle'
);

-- Sécurité : autorise le site à créer des commandes,
-- mais personne ne peut lire/modifier les commandes des autres via le site public.
alter table orders enable row level security;

create policy "Le site peut créer des commandes"
  on orders for insert
  with check (true);

-- Toi (propriétaire du projet) tu verras toutes les commandes
-- directement dans Table Editor, sans avoir besoin d'une policy de lecture.
