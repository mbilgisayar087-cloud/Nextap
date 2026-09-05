import { supabase } from '../lib/supabase';
import type { Business, BusinessFull } from '../types/database';

export interface BusinessListItem extends Business {
  category_name: string | null;
  nfc_card_code: string | null;
}

export async function listMyBusinesses(): Promise<BusinessListItem[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*, categories(name), nfc_cards(card_code)')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as any[]).map((b) => ({
    ...b,
    category_name: b.categories?.name ?? null,
    nfc_card_code: b.nfc_cards?.[0]?.card_code ?? null,
  }));
}

function slugify(name: string) {
  return (
    name
      .toLocaleLowerCase('tr-TR')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 6)
  );
}

const DEFAULT_SECTIONS: Array<{ section_type: string; sort_order: number }> = [
  { section_type: 'business', sort_order: 0 },
  { section_type: 'contact', sort_order: 1 },
];

export async function createBusiness(input: {
  name: string;
  category_id: string | null;
  is_active: boolean;
  owner_id: string;
}): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      name: input.name,
      category_id: input.category_id,
      is_active: input.is_active,
      owner_id: input.owner_id,
      slug: slugify(input.name),
    })
    .select()
    .single();
  if (error) throw error;

  const business = data as Business;

  // seed default sections (business info + contact) so the editor isn't empty
  const { error: sectionsError } = await supabase
    .from('business_sections')
    .insert(DEFAULT_SECTIONS.map((s) => ({ ...s, business_id: business.id })));
  if (sectionsError) throw sectionsError;

  return business;
}

export async function updateBusiness(id: string, patch: Partial<Business>): Promise<Business> {
  const { data, error } = await supabase.from('businesses').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Business;
}

export async function softDeleteBusiness(id: string): Promise<void> {
  const { error } = await supabase
    .from('businesses')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id);
  if (error) throw error;
}

export async function uploadBusinessAsset(businessId: string, file: File, kind: 'logo' | 'cover' | 'gallery' | 'service' | 'campaign' | 'announcement' | 'document'): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${businessId}/${kind}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('business-assets').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('business-assets').getPublicUrl(path);
  return data.publicUrl;
}

/** Loads a business plus every related record, for the editor and the public page. */
export async function getBusinessFull(businessId: string): Promise<BusinessFull | null> {
  const [
    businessRes,
    sectionsRes,
    contactRes,
    locationRes,
    socialRes,
    paymentRes,
    hoursRes,
    servicesRes,
    campaignsRes,
    galleryRes,
    appointmentRes,
    reviewsRes,
    announcementsRes,
    documentsRes,
  ] = await Promise.all([
    supabase.from('businesses').select('*, categories(name)').eq('id', businessId).is('deleted_at', null).single(),
    supabase.from('business_sections').select('*').eq('business_id', businessId).order('sort_order'),
    supabase.from('contacts').select('*').eq('business_id', businessId).maybeSingle(),
    supabase.from('locations').select('*').eq('business_id', businessId).maybeSingle(),
    supabase.from('social_links').select('*').eq('business_id', businessId).order('sort_order'),
    supabase.from('payment_accounts').select('*').eq('business_id', businessId).maybeSingle(),
    supabase.from('working_hours').select('*').eq('business_id', businessId).order('weekday'),
    supabase.from('services').select('*').eq('business_id', businessId).order('sort_order'),
    supabase.from('campaigns').select('*').eq('business_id', businessId).order('created_at'),
    supabase.from('gallery').select('*').eq('business_id', businessId).order('sort_order'),
    supabase.from('appointments').select('*').eq('business_id', businessId).maybeSingle(),
    supabase.from('reviews').select('*').eq('business_id', businessId).maybeSingle(),
    supabase.from('announcements').select('*').eq('business_id', businessId).order('announced_at', { ascending: false }),
    supabase.from('documents').select('*').eq('business_id', businessId).order('sort_order'),
  ]);

  if (businessRes.error || !businessRes.data) return null;

  const { categories, ...business } = businessRes.data as any;

  return {
    business: business as Business,
    categoryName: categories?.name ?? null,
    sections: (sectionsRes.data as any) ?? [],
    contact: (contactRes.data as any) ?? null,
    location: (locationRes.data as any) ?? null,
    social: (socialRes.data as any) ?? [],
    payment: (paymentRes.data as any) ?? null,
    workingHours: (hoursRes.data as any) ?? [],
    services: (servicesRes.data as any) ?? [],
    campaigns: (campaignsRes.data as any) ?? [],
    gallery: (galleryRes.data as any) ?? [],
    appointment: (appointmentRes.data as any) ?? null,
    reviews: (reviewsRes.data as any) ?? null,
    announcements: (announcementsRes.data as any) ?? [],
    documents: (documentsRes.data as any) ?? [],
  };
}

/** Public lookup used by the /k/[card_code] page — resolves through nfc_cards -> businesses. */
export async function getBusinessByCardCode(cardCode: string): Promise<
  | { status: 'not_found' }
  | { status: 'unassigned' }
  | { status: 'disabled' }
  | { status: 'ok'; data: BusinessFull }
> {
  const { data: card, error: cardError } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('card_code', cardCode)
    .maybeSingle();

  if (cardError || !card) return { status: 'not_found' };
  if (!card.business_id) return { status: 'unassigned' };
  if (card.status !== 'active') return { status: 'disabled' };

  const full = await getBusinessFull(card.business_id);
  if (!full || !full.business.is_active) return { status: 'disabled' };
  return { status: 'ok', data: full };
}
