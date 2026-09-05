import { useState } from 'react';
import type { Campaign } from '../../types/database';
import { campaignService } from '../../services/listSectionService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';

export default function CampaignsEditor({ businessId, items, onChange }: { businessId: string; items: Campaign[]; onChange: (i: Campaign[]) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('FIRSAT');
  const [couponCode, setCouponCode] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  async function handleAdd() {
    if (!title.trim()) return;
    setAdding(true);
    try {
      const created = await campaignService.create({
        business_id: businessId, title: title.trim(), description: description.trim() || null,
        badge: badge.trim() || 'FIRSAT', coupon_code: couponCode.trim() || null,
        starts_at: startsAt || null, ends_at: endsAt || null, is_active: true,
      });
      onChange([...items, created]);
      setTitle(''); setDescription(''); setCouponCode(''); setStartsAt(''); setEndsAt('');
      showToast('Kampanya eklendi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      const updated = await campaignService.update(id, { is_active: active });
      onChange(items.map((i) => (i.id === id ? updated : i)));
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function handleRemove(id: string) {
    try {
      await campaignService.remove(id);
      onChange(items.filter((i) => i.id !== id));
      showToast('Kampanya silindi.');
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((c) => {
        const expired = c.ends_at ? new Date(c.ends_at) < new Date() : false;
        return (
          <div key={c.id} style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="badge badge-warning">{c.badge}</span>
                  {c.title} {expired && <span className="badge badge-muted">Süresi doldu</span>}
                </div>
                {c.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.description}</div>}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {c.coupon_code && <span>Kupon: <strong>{c.coupon_code}</strong> · </span>}
                  {(c.starts_at || c.ends_at) && <span>{c.starts_at} — {c.ends_at}</span>}
                </div>
              </div>
              <Switch on={c.is_active} onChange={(v) => handleToggle(c.id, v)} />
              <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(c.id)}>🗑️</button>
            </div>
          </div>
        );
      })}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kampanya başlığı" />
          <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="Rozet (örn. FIRSAT, YENİ)" />
        </div>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" />
        <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Kupon kodu (opsiyonel)" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
          <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          <button className="btn btn-secondary" disabled={adding} onClick={handleAdd}>{adding ? <Spinner dark /> : '+ Ekle'}</button>
        </div>
      </div>
    </div>
  );
}
