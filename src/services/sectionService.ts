import { supabase } from '../lib/supabase';
import type { BusinessSection, SectionType } from '../types/database';

export async function addSection(businessId: string, sectionType: SectionType, nextSortOrder: number): Promise<BusinessSection> {
  const { data, error } = await supabase
    .from('business_sections')
    .insert({ business_id: businessId, section_type: sectionType, sort_order: nextSortOrder, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return data as BusinessSection;
}

export async function toggleSectionActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('business_sections').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

/** Persists a new drag-and-drop order. Called with the full, already-reordered list. */
export async function saveSectionOrder(sections: BusinessSection[]): Promise<void> {
  const updates = sections.map((s, index) =>
    supabase.from('business_sections').update({ sort_order: index }).eq('id', s.id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function removeSection(id: string): Promise<void> {
  const { error } = await supabase.from('business_sections').delete().eq('id', id);
  if (error) throw error;
}
