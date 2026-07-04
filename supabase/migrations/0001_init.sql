-- Phone Theft Response MVP — initial schema.
-- Auth is handled by Clerk (configured in Supabase as a third-party auth
-- provider), so user ids are Clerk user ids (text) and RLS policies read
-- the subject claim from the Clerk-issued JWT.

create or replace function public.requesting_user_id()
returns text
language sql stable
as $$
  select nullif(auth.jwt()->>'sub', '')
$$;

-- ---------------------------------------------------------------------------
-- users (profile data extending Clerk)
-- ---------------------------------------------------------------------------
create table public.users (
  id text primary key,                -- Clerk user id
  email text,
  phone_e164 text,                    -- +254 format
  full_name text,
  id_number text,                     -- Kenyan National ID (optional, needed for OB filing)
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (id = requesting_user_id());
create policy "users_insert_own" on public.users
  for insert with check (id = requesting_user_id());
create policy "users_update_own" on public.users
  for update using (id = requesting_user_id());
create policy "users_delete_own" on public.users
  for delete using (id = requesting_user_id());

-- ---------------------------------------------------------------------------
-- devices
-- ---------------------------------------------------------------------------
create type public.carrier_type as enum ('safaricom', 'airtel', 'telkom', 'multiple');

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  nickname text not null,
  make text not null,
  model text not null,
  color text,
  imei_primary text not null check (imei_primary ~ '^\d{15}$'),
  imei_secondary text check (imei_secondary is null or imei_secondary ~ '^\d{15}$'),
  serial_number text,
  purchase_date date,
  purchase_location text,
  carrier public.carrier_type not null default 'safaricom',
  msisdn text,                        -- +254 number on the device
  google_account_email text,
  icloud_account_email text,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index devices_user_id_idx on public.devices (user_id);

alter table public.devices enable row level security;

create policy "devices_select_own" on public.devices
  for select using (user_id = requesting_user_id());
create policy "devices_insert_own" on public.devices
  for insert with check (user_id = requesting_user_id());
create policy "devices_update_own" on public.devices
  for update using (user_id = requesting_user_id());
create policy "devices_delete_own" on public.devices
  for delete using (user_id = requesting_user_id());

-- ---------------------------------------------------------------------------
-- incidents
-- ---------------------------------------------------------------------------
create type public.incident_status as enum
  ('reporting', 'filed', 'resolved_recovered', 'resolved_written_off');

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  occurred_at timestamptz not null,
  location_description text not null,
  narrative text not null,
  ob_number text,
  police_station text,
  kecirt_reference text,
  kecirt_reported boolean not null default false,
  carrier_block_confirmed boolean not null default false,
  mpesa_locked boolean not null default false,
  google_account_signed_out boolean not null default false,
  icloud_signed_out boolean not null default false,
  lostphoneke_registered boolean not null default false,
  passwords_changed boolean not null default false,
  financial_loss boolean not null default false,
  dci_reported boolean not null default false,
  status public.incident_status not null default 'reporting',
  created_at timestamptz not null default now()
);

create index incidents_user_id_idx on public.incidents (user_id);
create index incidents_device_id_idx on public.incidents (device_id);

alter table public.incidents enable row level security;

create policy "incidents_select_own" on public.incidents
  for select using (user_id = requesting_user_id());
create policy "incidents_insert_own" on public.incidents
  for insert with check (user_id = requesting_user_id());
create policy "incidents_update_own" on public.incidents
  for update using (user_id = requesting_user_id());
create policy "incidents_delete_own" on public.incidents
  for delete using (user_id = requesting_user_id());

-- ---------------------------------------------------------------------------
-- emergency_contacts (Phase 2 — schema only, no UI yet)
-- ---------------------------------------------------------------------------
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  relationship text,
  created_at timestamptz not null default now()
);

create index emergency_contacts_user_id_idx on public.emergency_contacts (user_id);

alter table public.emergency_contacts enable row level security;

create policy "emergency_contacts_select_own" on public.emergency_contacts
  for select using (user_id = requesting_user_id());
create policy "emergency_contacts_insert_own" on public.emergency_contacts
  for insert with check (user_id = requesting_user_id());
create policy "emergency_contacts_update_own" on public.emergency_contacts
  for update using (user_id = requesting_user_id());
create policy "emergency_contacts_delete_own" on public.emergency_contacts
  for delete using (user_id = requesting_user_id());
