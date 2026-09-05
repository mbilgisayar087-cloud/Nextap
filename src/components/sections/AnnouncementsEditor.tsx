import { useState } from 'react';
import type { Announcement } from '../../types/database';
import { announcementService } from '../../services/listSectionService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';

export default function AnnouncementsEditor({ businessId, items, onChange }: { businessId: string; items: Announcement[]; onChange: (i: Announcement[]) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  async function handleAdd() {
    if (!title.trim()) return;
    setAdding(true);
    try {
      const created = await announcementService.create({ business_id: businessId, title: title.trim(), description: description.trim() || null, is_active: true, announced_at: new Date().toISOString().slice(0, 10) });
      onChange([created, ...items]);
      setTitle(''); setDescription('');
      showToast('Duyuru eklendi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      const updated = await announcementService.update(id, { is_active: active });
      onChange(items.map((i) => (i.id === id ? updated : i)));
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function handleRemove(id: string) {
    try {
      await announcementService.remove(id);
      onChange(items.filter((i) => i.id !== id));
      showToast('Duyuru silindi.');
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((a) => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--color-border)', borderRadius: 10, padding: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{a.title}</div>
            {a.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.description}</div>}
          </div>
          <Switch on={a.is_active} onChange={(v) => handleToggle(a.id, v)} />
          <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(a.id)}>🗑️</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Duyuru başlığı" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" />
        <button className="btn btn-secondary" disabled={adding} onClick={handleAdd}>{adding ? <Spinner dark /> : '+ Ekle'}</button>
      </div>
    </div>
  );
}
