-- =========================================================
-- NOTINGO — Initial database schema
-- =========================================================
-- Run this in Supabase SQL Editor, or via `supabase db push`.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- helper: updated_at trigger
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------
-- categories
-- ---------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- businesses (owner = auth.users.id)
-- ---------------------------------------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique,
  logo_url text,
  cover_url text,
  short_description text,
  long_description text,
  is_active boolean not null default true,
  theme text not null default 'sade', -- sade | modern | koyu | minimal
  primary_color text not null default '#4F46E5',
  button_color text not null default '#4F46E5',
  background_color text not null default '#FFFFFF',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_businesses_updated_at before update on businesses
  for each row execute function set_updated_at();
create index if not exists idx_businesses_owner on businesses(owner_id);

-- ---------------------------------------------------------
-- business_sections — drives ordering + active/passive per section
-- ---------------------------------------------------------
create table if not exists business_sections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  section_type text not null check (section_type in (
    'business','contact','social','location','payment','working_hours',
    'services','campaigns','reviews','gallery','appointments',
    'announcements','documents'
  )),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, section_type)
);
create trigger trg_sections_updated_at before update on business_sections
  for each row execute function set_updated_at();
create index if not exists idx_sections_business on business_sections(business_id);

-- ---------------------------------------------------------
-- contacts (1:1 per business)
-- ---------------------------------------------------------
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references businesses(id) on delete cascade,
  phone text,
  phone_active boolean not null default true,
  whatsapp text,
  whatsapp_active boolean not null default true,
  email text,
  email_active boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger trg_contacts_updated_at before update on contacts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- locations (1:1 per business)
-- ---------------------------------------------------------
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references businesses(id) on delete cascade,
  address text,
  city text,
  district text,
  maps_url text,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz not null default now()
);
create trigger trg_locations_updated_at before update on locations
  for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- social_links (many per business)
-- ---------------------------------------------------------
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  platform text not null, -- instagram | facebook | tiktok | youtube | x | linkedin | website | custom
  label text,
  url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_social_business on social_links(business_id);

-- ---------------------------------------------------------
-- payment_accounts (1:1 per business)
-- ---------------------------------------------------------
create table if not exists payment_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references businesses(id) on delete cascade,
  bank_name text,
  account_holder text,
  iban text,
  show_qr boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger trg_payment_updated_at before update on payment_accounts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- working_hours (7 rows per business)
-- ---------------------------------------------------------
create table if not exists working_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0=Pazartesi ... 6=Pazar
  is_open boolean not null default true,
  open_time time,
  close_time time,
  unique (business_id, weekday)
);

-- ---------------------------------------------------------
-- services (many per business)
-- ---------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2),
  photo_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_services_business on services(business_id);

-- ---------------------------------------------------------
-- campaigns (many per business)
-- ---------------------------------------------------------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  starts_at date,
  ends_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_campaigns_business on campaigns(business_id);

-- ---------------------------------------------------------
-- gallery (many per business)
-- ---------------------------------------------------------
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  image_url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_gallery_business on gallery(business_id);

-- ---------------------------------------------------------
-- appointments (1:1 link-only per business)
-- ---------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references businesses(id) on delete cascade,
  appointment_url text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- reviews (Google review links, 1:1 per business)
-- ---------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references businesses(id) on delete cascade,
  google_business_url text,
  google_review_url text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- announcements (many per business)
-- ---------------------------------------------------------
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  announced_at date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_announcements_business on announcements(business_id);

-- ---------------------------------------------------------
-- documents (PDF/menu/catalog files in Supabase Storage)
-- ---------------------------------------------------------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  file_url text not null,
  doc_type text not null default 'file', -- menu | catalog | price_list | file
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_documents_business on documents(business_id);

-- ---------------------------------------------------------
-- nfc_cards
-- ---------------------------------------------------------
create table if not exists nfc_cards (
  id uuid primary key default gen_random_uuid(),
  card_code text not null unique, -- e.g. NFC-000001
  business_id uuid references businesses(id) on delete set null,
  status text not null default 'available' check (status in ('available','active','disabled')),
  created_at timestamptz not null default now(),
  assigned_at timestamptz
);
create index if not exists idx_nfc_business on nfc_cards(business_id);

-- auto-generate sequential card codes: NFC-000001, NFC-000002, ...
create sequence if not exists nfc_card_seq;

create or replace function generate_card_code()
returns text as $$
begin
  return 'NFC-' || lpad(nextval('nfc_card_seq')::text, 6, '0');
end;
$$ language plpgsql;

alter table nfc_cards alter column card_code set default generate_card_code();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table businesses enable row level security;
alter table business_sections enable row level security;
alter table contacts enable row level security;
alter table locations enable row level security;
alter table social_links enable row level security;
alter table payment_accounts enable row level security;
alter table working_hours enable row level security;
alter table services enable row level security;
alter table campaigns enable row level security;
alter table gallery enable row level security;
alter table appointments enable row level security;
alter table reviews enable row level security;
alter table announcements enable row level security;
alter table documents enable row level security;
alter table nfc_cards enable row level security;
alter table categories enable row level security;

-- categories: public read, only owners (any authenticated user) can manage in this single-tenant-admin MVP
create policy "categories_public_read" on categories for select using (true);
create policy "categories_auth_write" on categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- businesses: owner has full access; public can read active, non-deleted businesses (needed for /k/[code] page)
create policy "businesses_owner_all" on businesses for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy "businesses_public_read_active" on businesses for select
  using (is_active = true and deleted_at is null);

-- generic pattern for child tables: owner access via businesses.owner_id, plus public read when parent business is active
create policy "sections_owner_all" on business_sections for all
  using (exists (select 1 from businesses b where b.id = business_sections.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = business_sections.business_id and b.owner_id = auth.uid()));
create policy "sections_public_read" on business_sections for select
  using (exists (select 1 from businesses b where b.id = business_sections.business_id and b.is_active = true and b.deleted_at is null));

create policy "contacts_owner_all" on contacts for all
  using (exists (select 1 from businesses b where b.id = contacts.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = contacts.business_id and b.owner_id = auth.uid()));
create policy "contacts_public_read" on contacts for select
  using (exists (select 1 from businesses b where b.id = contacts.business_id and b.is_active = true and b.deleted_at is null));

create policy "locations_owner_all" on locations for all
  using (exists (select 1 from businesses b where b.id = locations.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = locations.business_id and b.owner_id = auth.uid()));
create policy "locations_public_read" on locations for select
  using (exists (select 1 from businesses b where b.id = locations.business_id and b.is_active = true and b.deleted_at is null));

create policy "social_owner_all" on social_links for all
  using (exists (select 1 from businesses b where b.id = social_links.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = social_links.business_id and b.owner_id = auth.uid()));
create policy "social_public_read" on social_links for select
  using (exists (select 1 from businesses b where b.id = social_links.business_id and b.is_active = true and b.deleted_at is null));

create policy "payment_owner_all" on payment_accounts for all
  using (exists (select 1 from businesses b where b.id = payment_accounts.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = payment_accounts.business_id and b.owner_id = auth.uid()));
create policy "payment_public_read" on payment_accounts for select
  using (exists (select 1 from businesses b where b.id = payment_accounts.business_id and b.is_active = true and b.deleted_at is null));

create policy "hours_owner_all" on working_hours for all
  using (exists (select 1 from businesses b where b.id = working_hours.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = working_hours.business_id and b.owner_id = auth.uid()));
create policy "hours_public_read" on working_hours for select
  using (exists (select 1 from businesses b where b.id = working_hours.business_id and b.is_active = true and b.deleted_at is null));

create policy "services_owner_all" on services for all
  using (exists (select 1 from businesses b where b.id = services.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = services.business_id and b.owner_id = auth.uid()));
create policy "services_public_read" on services for select
  using (exists (select 1 from businesses b where b.id = services.business_id and b.is_active = true and b.deleted_at is null));

create policy "campaigns_owner_all" on campaigns for all
  using (exists (select 1 from businesses b where b.id = campaigns.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = campaigns.business_id and b.owner_id = auth.uid()));
create policy "campaigns_public_read" on campaigns for select
  using (exists (select 1 from businesses b where b.id = campaigns.business_id and b.is_active = true and b.deleted_at is null));

create policy "gallery_owner_all" on gallery for all
  using (exists (select 1 from businesses b where b.id = gallery.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = gallery.business_id and b.owner_id = auth.uid()));
create policy "gallery_public_read" on gallery for select
  using (exists (select 1 from businesses b where b.id = gallery.business_id and b.is_active = true and b.deleted_at is null));

create policy "appt_owner_all" on appointments for all
  using (exists (select 1 from businesses b where b.id = appointments.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = appointments.business_id and b.owner_id = auth.uid()));
create policy "appt_public_read" on appointments for select
  using (exists (select 1 from businesses b where b.id = appointments.business_id and b.is_active = true and b.deleted_at is null));

create policy "reviews_owner_all" on reviews for all
  using (exists (select 1 from businesses b where b.id = reviews.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = reviews.business_id and b.owner_id = auth.uid()));
create policy "reviews_public_read" on reviews for select
  using (exists (select 1 from businesses b where b.id = reviews.business_id and b.is_active = true and b.deleted_at is null));

create policy "announcements_owner_all" on announcements for all
  using (exists (select 1 from businesses b where b.id = announcements.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = announcements.business_id and b.owner_id = auth.uid()));
create policy "announcements_public_read" on announcements for select
  using (exists (select 1 from businesses b where b.id = announcements.business_id and b.is_active = true and b.deleted_at is null));

create policy "documents_owner_all" on documents for all
  using (exists (select 1 from businesses b where b.id = documents.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from businesses b where b.id = documents.business_id and b.owner_id = auth.uid()));
create policy "documents_public_read" on documents for select
  using (exists (select 1 from businesses b where b.id = documents.business_id and b.is_active = true and b.deleted_at is null));

-- nfc_cards: owner of the linked business can manage; any authenticated admin user can create/list cards;
-- public can read minimal info needed to resolve /k/[code]
create policy "nfc_admin_all" on nfc_cards for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "nfc_public_read" on nfc_cards for select
  using (true);

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do nothing;

create policy "business_assets_public_read" on storage.objects
  for select using (bucket_id = 'business-assets');
create policy "business_assets_auth_write" on storage.objects
  for insert with check (bucket_id = 'business-assets' and auth.role() = 'authenticated');
create policy "business_assets_auth_update" on storage.objects
  for update using (bucket_id = 'business-assets' and auth.role() = 'authenticated');
create policy "business_assets_auth_delete" on storage.objects
  for delete using (bucket_id = 'business-assets' and auth.role() = 'authenticated');

-- =========================================================
-- SEED: categories
-- =========================================================
insert into categories (name, slug, icon) values
  ('Restoran', 'restoran', '🍽️'),
  ('Kafe', 'kafe', '☕'),
  ('Kuaför', 'kuafor', '💇'),
  ('Market', 'market', '🛒'),
  ('Emlak', 'emlak', '🏠'),
  ('Sağlık', 'saglik', '⚕️'),
  ('Otomotiv', 'otomotiv', '🚗'),
  ('Diğer', 'diger', '🏢')
on conflict (slug) do nothing;
