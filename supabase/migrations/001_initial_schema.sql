-- Extension UUID
create extension if not exists "uuid-ossp";

-- Enum role
create type user_role as enum ('person', 'practitioner');

-- Table profiles (liée à auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'person',
  first_name text not null,
  created_at timestamptz not null default now()
);

-- Table practitioners (1-1 avec profiles)
create table practitioners (
  id uuid primary key references profiles(id) on delete cascade,
  bio text not null default '',
  languages text[] not null default '{}',
  country text not null default 'ES',
  eipv_certification_number text not null,
  stripe_account_id text,
  is_available_now boolean not null default false,
  is_active boolean not null default false,
  avg_rating numeric(3,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Table availability_slots
create table availability_slots (
  id uuid primary key default uuid_generate_v4(),
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null
);

-- =====================
-- Row Level Security
-- =====================

alter table profiles enable row level security;
alter table practitioners enable row level security;
alter table availability_slots enable row level security;

-- profiles : chaque utilisateur voit/modifie son propre profil
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- practitioners : profils actifs lisibles publiquement
create policy "practitioners_select_active" on practitioners
  for select using (is_active = true);

create policy "practitioners_update_own" on practitioners
  for update using (auth.uid() = id);

-- availability_slots : lisibles publiquement, modifiables par le praticien
create policy "slots_select_all" on availability_slots
  for select using (true);

create policy "slots_insert_own" on availability_slots
  for insert with check (auth.uid() = practitioner_id);

create policy "slots_update_own" on availability_slots
  for update using (auth.uid() = practitioner_id);

create policy "slots_delete_own" on availability_slots
  for delete using (auth.uid() = practitioner_id);

-- =====================
-- Trigger : créer profil automatiquement après inscription
-- =====================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, first_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'person'),
    coalesce(new.raw_user_meta_data->>'first_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
