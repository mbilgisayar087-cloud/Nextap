import { supabase } from '../lib/supabase';

export interface NextapContact {
  phone: string;
  whatsapp: string;
  instagram: string;
  slogan: string;
}

export async function getNextapContact(): Promise<NextapContact> {
  const { data, error } = await supabase
    .from('nextap_contact')
    .select('phone,whatsapp,instagram,slogan')
    .eq('id', 1)
    .single();
  if (error || !data) {
    return {
      phone: '+905528134370',
      whatsapp: '+905528134370',
      instagram: 'https://instagram.com/nextap',
      slogan: 'Bir dokunuşta tüm bilgileriniz — NFC ile geleceğe adım atın!',
    };
  }
  return data as NextapContact;
}

export async function saveNextapContact(patch: Partial<NextapContact>): Promise<void> {
  const { error } = await supabase
    .from('nextap_contact')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}
