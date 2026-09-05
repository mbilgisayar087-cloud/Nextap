-- NexTap platform iletişim bilgileri (admin panelinden düzenlenebilir)
create table if not exists nextap_contact (
  id        int primary key default 1 check (id = 1), -- tek satır
  phone     text not null default '+905528134370',
  whatsapp  text not null default '+905528134370',
  instagram text not null default 'https://instagram.com/nextap',
  slogan    text not null default 'Bir dokunuşta tüm bilgileriniz — NFC ile geleceğe adım atın!',
  updated_at timestamptz not null default now()
);

-- Tek satırı başlat
insert into nextap_contact (id) values (1) on conflict (id) do nothing;

-- RLS: public okuyabilir, authenticated yazabilir
alter table nextap_contact enable row level security;
create policy "nextap_contact_public_read" on nextap_contact for select using (true);
create policy "nextap_contact_auth_write"  on nextap_contact for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
