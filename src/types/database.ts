// Core domain types mirroring the Supabase/Postgres schema.

export type SectionType =
  | 'business'
  | 'contact'
  | 'social'
  | 'location'
  | 'payment'
  | 'working_hours'
  | 'services'
  | 'campaigns'
  | 'reviews'
  | 'gallery'
  | 'appointments'
  | 'announcements'
  | 'documents';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Business {
  id: string;
  owner_id: string;
  category_id: string | null;
  name: string;
  slug: string | null;
  logo_url: string | null;
  cover_url: string | null;
  short_description: string | null;
  long_description: string | null;
  tagline: string | null;
  is_active: boolean;
  theme: 'sade' | 'modern' | 'koyu' | 'minimal';
  primary_color: string;
  button_color: string;
  background_color: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessSection {
  id: string;
  business_id: string;
  section_type: SectionType;
  sort_order: number;
  is_active: boolean;
}

export interface Contact {
  id: string;
  business_id: string;
  phone: string | null;
  phone_active: boolean;
  phone_display: string | null;
  whatsapp: string | null;
  whatsapp_active: boolean;
  whatsapp_prefilled_message: string | null;
  email: string | null;
  email_active: boolean;
  sms: string | null;
  sms_active: boolean;
  sms_prefilled_message: string | null;
}

export interface Location {
  id: string;
  business_id: string;
  address: string | null;
  city: string | null;
  district: string | null;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  show_map: boolean;
}

export interface SocialLink {
  id: string;
  business_id: string;
  platform: string;
  label: string | null;
  username: string | null;
  url: string;
  is_active: boolean;
  sort_order: number;
}

export interface PaymentAccount {
  id: string;
  business_id: string;
  bank_name: string | null;
  account_holder: string | null;
  iban: string | null;
  show_qr: boolean;
}

export interface WorkingHour {
  id: string;
  business_id: string;
  weekday: number; // 0=Pazartesi ... 6=Pazar
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

export interface ServiceItem {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number | null;
  photo_url: string | null;
  tag: string | null;
  currency: string;
  is_active: boolean;
  sort_order: number;
}

export interface Campaign {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  badge: string;
  coupon_code: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface GalleryImage {
  id: string;
  business_id: string;
  image_url: string;
  title: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Appointment {
  id: string;
  business_id: string;
  appointment_url: string | null;
  notes: string | null;
  whatsapp_booking: boolean;
}

export interface ReviewLinks {
  id: string;
  business_id: string;
  google_business_url: string | null;
  google_review_url: string | null;
  rating: number | null;
  review_count: number | null;
}

export interface Announcement {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  announced_at: string;
  is_active: boolean;
}

export interface DocumentFile {
  id: string;
  business_id: string;
  title: string;
  file_url: string;
  file_size: string | null;
  doc_type: 'menu' | 'catalog' | 'price_list' | 'file';
  is_active: boolean;
  sort_order: number;
}

export type NfcStatus = 'available' | 'active' | 'disabled';

export interface NfcCard {
  id: string;
  card_code: string;
  business_id: string | null;
  status: NfcStatus;
  created_at: string;
  assigned_at: string | null;
}

// Aggregate shape used by the editor + public page: a business with
// every related record loaded, keyed by section type where relevant.
export interface BusinessFull {
  business: Business;
  categoryName: string | null;
  sections: BusinessSection[];
  contact: Contact | null;
  location: Location | null;
  social: SocialLink[];
  payment: PaymentAccount | null;
  workingHours: WorkingHour[];
  services: ServiceItem[];
  campaigns: Campaign[];
  gallery: GalleryImage[];
  appointment: Appointment | null;
  reviews: ReviewLinks | null;
  announcements: Announcement[];
  documents: DocumentFile[];
}

export const SECTION_LABELS: Record<SectionType, { label: string; icon: string }> = {
  business: { label: 'İşletme Bilgileri', icon: '🏢' },
  contact: { label: 'İletişim', icon: '📞' },
  social: { label: 'Sosyal Medya', icon: '🌐' },
  location: { label: 'Konum', icon: '📍' },
  payment: { label: 'Ödeme', icon: '💳' },
  working_hours: { label: 'Çalışma Saatleri', icon: '🕒' },
  services: { label: 'Hizmetler', icon: '🛠️' },
  campaigns: { label: 'Kampanyalar', icon: '🎉' },
  reviews: { label: 'Google Yorumları', icon: '⭐' },
  gallery: { label: 'Galeri', icon: '🖼️' },
  appointments: { label: 'Randevu', icon: '📅' },
  announcements: { label: 'Duyurular', icon: '📢' },
  documents: { label: 'Dosyalar', icon: '📄' },
};

export const WEEKDAY_LABELS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
