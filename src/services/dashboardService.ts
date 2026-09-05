import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalNfcCards: number;
  availableNfcCards: number;
  activeNfcCards: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalB, activeB, totalC, availC, activeC] = await Promise.all([
    supabase.from('businesses').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('businesses').select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true),
    supabase.from('nfc_cards').select('id', { count: 'exact', head: true }),
    supabase.from('nfc_cards').select('id', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('nfc_cards').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  return {
    totalBusinesses: totalB.count ?? 0,
    activeBusinesses: activeB.count ?? 0,
    totalNfcCards: totalC.count ?? 0,
    availableNfcCards: availC.count ?? 0,
    activeNfcCards: activeC.count ?? 0,
  };
}
