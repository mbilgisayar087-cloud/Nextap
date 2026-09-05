import { supabase } from '../lib/supabase';
import type { Announcement, Campaign, DocumentFile, GalleryImage, ServiceItem, SocialLink } from '../types/database';

// Thin, uniform CRUD helpers for the "many per business" section tables.
// Each table shares the same shape of operations: create, update, delete, reorder.

function makeListService<T extends { id: string }>(table: string) {
  return {
    async create(row: Partial<T>): Promise<T> {
      const { data, error } = await supabase.from(table).insert(row as any).select().single();
      if (error) throw error;
      return data as T;
    },
    async update(id: string, patch: Partial<T>): Promise<T> {
      const { data, error } = await supabase.from(table).update(patch as any).eq('id', id).select().single();
      if (error) throw error;
      return data as T;
    },
    async remove(id: string): Promise<void> {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    async reorder(items: T[]): Promise<void> {
      const updates = items.map((item, index) => supabase.from(table).update({ sort_order: index }).eq('id', item.id));
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
  };
}

export const socialLinkService = makeListService<SocialLink>('social_links');
export const serviceItemService = makeListService<ServiceItem>('services');
export const campaignService = makeListService<Campaign>('campaigns');
export const galleryService = makeListService<GalleryImage>('gallery');
export const announcementService = makeListService<Announcement>('announcements');
export const documentService = makeListService<DocumentFile>('documents');
