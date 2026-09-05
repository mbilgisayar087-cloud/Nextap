import type { BusinessFull, SectionType } from '../types/database';
import { WEEKDAY_LABELS } from '../types/database';

// Shape mirrors the reference CustomerView.tsx component's `Business` prop
// exactly (field names included) so that component's JSX can be reused
// almost verbatim. Values are derived from BusinessFull + business_sections
// (which is NexTap's single source of truth for section visibility).

export interface LegacyWorkingHour {
  dayIndex: number; // JS Date.getDay() convention: 0 = Sunday ... 6 = Saturday
  dayName: string;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface LegacySocial {
  id: string;
  platform: string;
  title: string;
  url: string;
  username: string | null;
  active: boolean;
}

export interface LegacyService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  image: string | null;
  tag: string | null;
  active: boolean;
}

export interface LegacyCampaign {
  id: string;
  title: string;
  description: string | null;
  badge: string;
  couponCode: string | null;
  validUntil: string | null;
  active: boolean;
}

export interface LegacyAnnouncement {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  active: boolean;
}

export interface LegacyDocument {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileSize: string | null;
  active: boolean;
}

export interface LegacyGalleryPhoto {
  id: string;
  title: string | null;
  imageUrl: string;
  active: boolean;
}

export interface LegacyBusiness {
  id: string;
  name: string;
  tagline: string | null;
  categoryName: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isActive: boolean;
  nfcCardId: string | null;

  contactEnabled: boolean;
  contact: {
    enabled: boolean;
    phone: { value: string | null; active: boolean; display: string | null };
    whatsapp: { value: string | null; active: boolean; prefilledMessage: string | null };
    sms: { value: string | null; active: boolean; prefilledMessage: string | null };
    email: { value: string | null; active: boolean };
  };

  locationEnabled: boolean;
  location: {
    enabled: boolean;
    address: string | null;
    city: string | null;
    district: string | null;
    mapsUrl: string | null;
    showMap: boolean;
  } | null;

  socialMediaEnabled: boolean;
  socialMedia: LegacySocial[];

  paymentEnabled: boolean;
  payment: {
    enabled: boolean;
    bankName: string | null;
    branchName: string | null;
    accountHolder: string | null;
    iban: string | null;
  } | null;

  workingHoursEnabled: boolean;
  workingHours: LegacyWorkingHour[];

  servicesEnabled: boolean;
  services: LegacyService[];

  campaignsEnabled: boolean;
  campaigns: LegacyCampaign[];

  googleEnabled: boolean;
  google: { enabled: boolean; rating: number | null; reviewCount: number | null; reviewUrl: string | null } | null;

  galleryEnabled: boolean;
  gallery: LegacyGalleryPhoto[];

  appointmentEnabled: boolean;
  appointment: { enabled: boolean; appointmentUrl: string | null; notes: string | null; whatsappBooking: boolean } | null;

  announcementsEnabled: boolean;
  announcements: LegacyAnnouncement[];

  documentsEnabled: boolean;
  documents: LegacyDocument[];
}

function isSectionActive(sections: BusinessFull['sections'], type: SectionType): boolean {
  return sections.find((s) => s.section_type === type)?.is_active ?? false;
}

export function toLegacyBusiness(data: BusinessFull, cardCode: string | null): LegacyBusiness {
  const { business, sections } = data;

  return {
    id: business.id,
    name: business.name,
    tagline: business.tagline,
    categoryName: data.categoryName,
    logoUrl: business.logo_url,
    coverUrl: business.cover_url,
    isActive: business.is_active,
    nfcCardId: cardCode,

    contactEnabled: isSectionActive(sections, 'contact'),
    contact: {
      enabled: isSectionActive(sections, 'contact'),
      phone: { value: data.contact?.phone ?? null, active: data.contact?.phone_active ?? false, display: data.contact?.phone_display ?? null },
      whatsapp: { value: data.contact?.whatsapp ?? null, active: data.contact?.whatsapp_active ?? false, prefilledMessage: data.contact?.whatsapp_prefilled_message ?? null },
      sms: { value: data.contact?.sms ?? null, active: data.contact?.sms_active ?? false, prefilledMessage: data.contact?.sms_prefilled_message ?? null },
      email: { value: data.contact?.email ?? null, active: data.contact?.email_active ?? false },
    },

    locationEnabled: isSectionActive(sections, 'location'),
    location: data.location
      ? {
          enabled: isSectionActive(sections, 'location'),
          address: data.location.address,
          city: data.location.city,
          district: data.location.district,
          mapsUrl: data.location.maps_url,
          showMap: data.location.show_map,
        }
      : null,

    socialMediaEnabled: isSectionActive(sections, 'social'),
    socialMedia: data.social.map((s) => ({
      id: s.id,
      platform: s.platform,
      title: s.label || s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
      url: s.url,
      username: s.username,
      active: s.is_active,
    })),

    paymentEnabled: isSectionActive(sections, 'payment'),
    payment: data.payment
      ? {
          enabled: isSectionActive(sections, 'payment'),
          bankName: data.payment.bank_name,
          branchName: null,
          accountHolder: data.payment.account_holder,
          iban: data.payment.iban,
        }
      : null,

    workingHoursEnabled: isSectionActive(sections, 'working_hours'),
    workingHours: [...data.workingHours]
      .sort((a, b) => a.weekday - b.weekday)
      .map((h) => ({
        dayIndex: h.weekday === 6 ? 0 : h.weekday + 1, // convert Mon-first (0..6) to JS getDay() (Sun-first)
        dayName: WEEKDAY_LABELS[h.weekday],
        isClosed: !h.is_open,
        openTime: h.open_time,
        closeTime: h.close_time,
      })),

    servicesEnabled: isSectionActive(sections, 'services'),
    services: data.services.map((s) => ({
      id: s.id, name: s.name, description: s.description, price: s.price,
      currency: s.currency, image: s.photo_url, tag: s.tag, active: s.is_active,
    })),

    campaignsEnabled: isSectionActive(sections, 'campaigns'),
    campaigns: data.campaigns.map((c) => ({
      id: c.id, title: c.title, description: c.description, badge: c.badge,
      couponCode: c.coupon_code, validUntil: c.ends_at, active: c.is_active,
    })),

    googleEnabled: isSectionActive(sections, 'reviews'),
    google: data.reviews
      ? { enabled: isSectionActive(sections, 'reviews'), rating: data.reviews.rating, reviewCount: data.reviews.review_count, reviewUrl: data.reviews.google_review_url }
      : null,

    galleryEnabled: isSectionActive(sections, 'gallery'),
    gallery: data.gallery.map((g) => ({ id: g.id, title: g.title, imageUrl: g.image_url, active: g.is_active })),

    appointmentEnabled: isSectionActive(sections, 'appointments'),
    appointment: data.appointment
      ? { enabled: isSectionActive(sections, 'appointments'), appointmentUrl: data.appointment.appointment_url, notes: data.appointment.notes, whatsappBooking: data.appointment.whatsapp_booking }
      : null,

    announcementsEnabled: isSectionActive(sections, 'announcements'),
    announcements: data.announcements.map((a) => ({ id: a.id, title: a.title, description: a.description, date: a.announced_at, active: a.is_active })),

    documentsEnabled: isSectionActive(sections, 'documents'),
    documents: data.documents.map((d) => ({ id: d.id, title: d.title, type: d.doc_type, fileUrl: d.file_url, fileSize: d.file_size, active: d.is_active })),
  };
}
