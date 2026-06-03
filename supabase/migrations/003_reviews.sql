-- Table reviews (notation anonyme après session)
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- RLS
alter table reviews enable row level security;

-- Lecture publique des notes (pour calculer avg_rating)
create policy "reviews_select_all" on reviews
  for select using (true);

-- Insertion uniquement par la personne de la session
create policy "reviews_insert_person" on reviews
  for insert with check (
    auth.uid() = (select person_id from sessions where id = session_id)
  );
