import { useState } from 'react';
import type { ServiceItem } from '../../types/database';
import { serviceItemService } from '../../services/listSectionService';
import { uploadBusinessAsset } from '../../services/businessService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';

export default function ServicesEditor({ businessId, items, onChange }: { businessId: string; items: ServiceItem[]; onChange: (i: ServiceItem[]) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [tag, setTag] = useState('');
  const [currency, setCurrency] = useState('TL');
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      const created = await serviceItemService.create({
        business_id: businessId, name: name.trim(), description: description.trim() || null,
        price: price ? parseFloat(price) : null, tag: tag.trim() || null, currency,
        is_active: true, sort_order: items.length,
      });
      onChange([...items, created]);
      setName(''); setDescription(''); setPrice(''); setTag('');
      showToast('Hizmet eklendi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      const updated = await serviceItemService.update(id, { is_active: active });
      onChange(items.map((i) => (i.id === id ? updated : i)));
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function handleRemove(id: string) {
    try {
      await serviceItemService.remove(id);
      onChange(items.filter((i) => i.id !== id));
      showToast('Hizmet silindi.');
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function handlePhoto(id: string, file: File) {
    try {
      const url = await uploadBusinessAsset(businessId, file, 'service');
      const updated = await serviceItemService.update(id, { photo_url: url });
      onChange(items.map((i) => (i.id === id ? updated : i)));
    } catch (err) { showToast(friendlyError(err, 'Fotoğraf yüklenemedi.'), 'error'); }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((i) => (
        <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--color-border)', borderRadius: 10, padding: 10 }}>
          <label style={{ width: 36, height: 36, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
            {i.photo_url ? <img src={i.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛠️'}
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handlePhoto(i.id, e.target.files[0])} />
          </label>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              {i.name}
              {i.tag && <span className="badge badge-warning">{i.tag}</span>}
            </div>
            {i.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{i.description}</div>}
          </div>
          {i.price != null && <span style={{ fontSize: 13, fontWeight: 700 }}>{i.price} {i.currency}</span>}
          <Switch on={i.is_active} onChange={(v) => handleToggle(i.id, v)} />
          <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(i.id)}>🗑️</button>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 0.6fr 0.5fr 0.6fr auto', gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hizmet adı" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Fiyat" type="number" />
        <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="TL" />
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Etiket (Yeni, Popüler)" />
        <button className="btn btn-secondary" disabled={adding} onClick={handleAdd}>{adding ? <Spinner dark /> : '+ Ekle'}</button>
      </div>
    </div>
  );
}
