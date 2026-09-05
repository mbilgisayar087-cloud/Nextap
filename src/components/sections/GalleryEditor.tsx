import { useState } from 'react';
import type { GalleryImage } from '../../types/database';
import { galleryService } from '../../services/listSectionService';
import { uploadBusinessAsset } from '../../services/businessService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';

export default function GalleryEditor({ businessId, images, onChange }: { businessId: string; images: GalleryImage[]; onChange: (i: GalleryImage[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleUpload(files: FileList) {
    setUploading(true);
    try {
      const created: GalleryImage[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadBusinessAsset(businessId, file, 'gallery');
        const row = await galleryService.create({ business_id: businessId, image_url: url, is_active: true, sort_order: images.length + created.length });
        created.push(row);
      }
      onChange([...images, ...created]);
      showToast('Fotoğraflar yüklendi.');
    } catch (err) {
      showToast(friendlyError(err, 'Fotoğraf yüklenemedi.'), 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      const updated = await galleryService.update(id, { is_active: active });
      onChange(images.map((i) => (i.id === id ? updated : i)));
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function handleRemove(id: string) {
    try {
      await galleryService.remove(id);
      onChange(images.filter((i) => i.id !== id));
      showToast('Fotoğraf silindi.');
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    try {
      await galleryService.reorder(next);
    } catch (err) {
      showToast(friendlyError(err, 'Sıralama kaydedilemedi.'), 'error');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
        {images.map((img, idx) => (
          <div key={img.id} style={{ position: 'relative' }}>
            <img src={img.image_url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, opacity: img.is_active ? 1 : 0.4 }} />
            <input
              value={img.title ?? ''}
              placeholder="Başlık"
              onChange={(e) => onChange(images.map((i) => (i.id === img.id ? { ...i, title: e.target.value } : i)))}
              onBlur={(e) => galleryService.update(img.id, { title: e.target.value || null }).catch(() => showToast('Başlık kaydedilemedi.', 'error'))}
              style={{ marginTop: 4, fontSize: 11, padding: '4px 6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => move(idx, -1)}>↑</button>
                <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => move(idx, 1)}>↓</button>
              </div>
              <Switch on={img.is_active} onChange={(v) => handleToggle(img.id, v)} />
              <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => handleRemove(img.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <label className="btn btn-secondary" style={{ justifySelf: 'start', cursor: 'pointer' }}>
        {uploading ? <Spinner dark /> : '+ Fotoğraf Yükle'}
        <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </label>
    </div>
  );
}
