import { supabase } from '../lib/supabase';
import type { Appointment, Contact, Location, PaymentAccount, ReviewLinks, WorkingHour } from '../types/database';

// Each of these tables has a UNIQUE business_id, so upsert (onConflict) keeps
// exactly one row per business and lets "save" work whether or not it exists yet.

export async function upsertContact(businessId: string, patch: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .upsert({ business_id: businessId, ...patch }, { onConflict: 'business_id' })
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}

export async function upsertLocation(businessId: string, patch: Partial<Location>): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .upsert({ business_id: businessId, ...patch }, { onConflict: 'business_id' })
    .select()
    .single();
  if (error) throw error;
  return data as Location;
}

export async function upsertPayment(businessId: string, patch: Partial<PaymentAccount>): Promise<PaymentAccount> {
  const { data, error } = await supabase
    .from('payment_accounts')
    .upsert({ business_id: businessId, ...patch }, { onConflict: 'business_id' })
    .select()
    .single();
  if (error) throw error;
  return data as PaymentAccount;
}

export async function upsertAppointment(
  businessId: string,
  appointmentUrl: string,
  notes?: string | null,
  whatsappBooking?: boolean
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .upsert(
      { business_id: businessId, appointment_url: appointmentUrl, notes: notes ?? null, whatsapp_booking: whatsappBooking ?? false },
      { onConflict: 'business_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as Appointment;
}

export async function upsertReviews(businessId: string, patch: Partial<ReviewLinks>): Promise<ReviewLinks> {
  const { data, error } = await supabase
    .from('reviews')
    .upsert({ business_id: businessId, ...patch }, { onConflict: 'business_id' })
    .select()
    .single();
  if (error) throw error;
  return data as ReviewLinks;
}

export async function saveWorkingHours(businessId: string, hours: WorkingHour[]): Promise<void> {
  const rows = hours.map((h) => ({
    business_id: businessId,
    weekday: h.weekday,
    is_open: h.is_open,
    open_time: h.open_time,
    close_time: h.close_time,
  }));
  const { error } = await supabase.from('working_hours').upsert(rows, { onConflict: 'business_id,weekday' });
  if (error) throw error;
}
