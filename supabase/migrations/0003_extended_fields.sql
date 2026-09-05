-- =========================================================
-- NOTINGO — Extended fields migration
-- Adds every field referenced by the richer editor/preview
-- reference implementation (tagline, SMS contact, prefilled
-- messages, Google rating, campaign coupon codes, etc).
-- Safe to re-run: every column uses IF NOT EXISTS.
-- =========================================================

-- businesses: slogan
alter table businesses add column if not exists tagline text;

-- contacts: SMS channel + prefilled messages + display override
alter table contacts add column if not exists phone_display text;
alter table contacts add column if not exists whatsapp_prefilled_message text;
alter table contacts add column if not exists sms text;
alter table contacts add column if not exists sms_active boolean not null default true;
alter table contacts add column if not exists sms_prefilled_message text;

-- locations: whether to render the embedded live map
alter table locations add column if not exists show_map boolean not null default true;

-- reviews: Google rating shown next to the "değerlendir" button
alter table reviews add column if not exists rating numeric(2,1);
alter table reviews add column if not exists review_count int;

-- appointments: helper note + optional WhatsApp booking button
alter table appointments add column if not exists notes text;
alter table appointments add column if not exists whatsapp_booking boolean not null default false;

-- services: highlight tag (e.g. "Yeni", "Popüler") + currency label
alter table services add column if not exists tag text;
alter table services add column if not exists currency text not null default 'TL';

-- campaigns: badge label + coupon code (separate from the existing date range)
alter table campaigns add column if not exists badge text not null default 'FIRSAT';
alter table campaigns add column if not exists coupon_code text;

-- gallery: per-photo caption
alter table gallery add column if not exists title text;

-- social_links: handle shown next to the platform name (e.g. "@abckebap")
alter table social_links add column if not exists username text;

-- documents: human-readable file size shown in the list
alter table documents add column if not exists file_size text;
