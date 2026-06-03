-- Enum mode de session
create type session_mode as enum ('ahora', 'reservar');

-- Enum statut de session
create type session_status as enum (
  'pending_payment',
  'pending_practitioner',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'refunded'
);

-- Table sessions
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid not null references profiles(id) on delete restrict,
  practitioner_id uuid not null references practitioners(id) on delete restrict,
  mode session_mode not null default 'ahora',
  status session_status not null default 'pending_payment',
  scheduled_at timestamptz,
  duration_minutes int not null default 20,
  amount_cents int not null default 2900,
  platform_fee_cents int not null default 435,
  stripe_payment_intent_id text,
  daily_room_url text,
  created_at timestamptz not null default now()
);

-- RLS
alter table sessions enable row level security;

-- Une personne voit ses propres sessions
create policy "sessions_select_person" on sessions
  for select using (auth.uid() = person_id);

-- Un praticien voit ses propres sessions
create policy "sessions_select_practitioner" on sessions
  for select using (auth.uid() = practitioner_id);

-- Seul le système (service role) peut insérer/modifier
create policy "sessions_insert_service" on sessions
  for insert with check (auth.uid() = person_id);

create policy "sessions_update_service" on sessions
  for update using (auth.uid() = person_id or auth.uid() = practitioner_id);
