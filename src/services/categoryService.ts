import { supabase } from '../lib/supabase';
import type { Category } from '../types/database';

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data as Category[];
}

export async function createCategory(name: string, icon?: string): Promise<Category> {
  const slug = name
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, icon: icon ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}
