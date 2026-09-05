-- =========================================================
-- DEV-ONLY seed data — ABC KEBAP + NFC-000001
-- Run this manually only in your development project.
-- Do NOT run in production.
-- =========================================================
-- NOTE: replace :owner_id below with a real auth.users id
-- (create a user first via Supabase Auth, then run this file
-- with that user's UUID substituted in).
-- Example: \set owner_id 'a1b2c3d4-....'

do $$
declare
  v_owner_id uuid;
  v_business_id uuid;
  v_category_id uuid;
begin
  -- pick the first existing user as the demo owner
  select id into v_owner_id from auth.users limit 1;
  if v_owner_id is null then
    raise notice 'No auth.users found — create an admin user first, then re-run this seed.';
    return;
  end if;

  select id into v_category_id from categories where slug = 'restoran';

  insert into businesses (owner_id, category_id, name, slug, short_description, is_active, primary_color)
  values (v_owner_id, v_category_id, 'ABC KEBAP', 'abc-kebap', 'Erzurum''un en lezzetli kebapçısı', true, '#EA580C')
  returning id into v_business_id;

  insert into business_sections (business_id, section_type, sort_order, is_active) values
    (v_business_id, 'business', 0, true),
    (v_business_id, 'contact', 1, true),
    (v_business_id, 'social', 2, true),
    (v_business_id, 'location', 3, true),
    (v_business_id, 'working_hours', 4, true),
    (v_business_id, 'services', 5, true),
    (v_business_id, 'campaigns', 6, true),
    (v_business_id, 'gallery', 7, true),
    (v_business_id, 'payment', 8, true);

  insert into contacts (business_id, phone, whatsapp, email)
  values (v_business_id, '+905551112233', '+905551112233', 'info@abckebap.com');

  insert into social_links (business_id, platform, url, sort_order) values
    (v_business_id, 'instagram', 'https://instagram.com/abckebap', 0);

  insert into payment_accounts (business_id, bank_name, account_holder, iban)
  values (v_business_id, 'Ziraat Bankası', 'ABC Kebap Gıda Ltd. Şti.', 'TR330006100519786457841326');

  insert into locations (business_id, address, city, district)
  values (v_business_id, 'Cumhuriyet Cad. No:12', 'Erzurum', 'Yakutiye');

  insert into working_hours (business_id, weekday, is_open, open_time, close_time)
  select v_business_id, gs, true, '10:00', '22:00' from generate_series(0,6) gs;

  insert into services (business_id, name, description, price, sort_order) values
    (v_business_id, 'Adana Kebap', 'Özel baharatlarla hazırlanan acılı kebap', 250, 0),
    (v_business_id, 'Lahmacun', 'İnce hamur üzeri kıymalı lahmacun', 90, 1);

  insert into campaigns (business_id, title, description, starts_at, ends_at) values
    (v_business_id, 'Hafta Sonu Kampanyası', '2 adet kebap alana 1 ayran hediye', current_date, current_date + 14);

  insert into gallery (business_id, image_url, sort_order) values
    (v_business_id, 'https://picsum.photos/seed/abckebap1/600/400', 0),
    (v_business_id, 'https://picsum.photos/seed/abckebap2/600/400', 1);

  insert into nfc_cards (card_code, business_id, status, assigned_at)
  values ('NFC-000001', v_business_id, 'active', now())
  on conflict (card_code) do update set business_id = v_business_id, status = 'active', assigned_at = now();

  raise notice 'Seed complete. Business id: %', v_business_id;
end $$;
