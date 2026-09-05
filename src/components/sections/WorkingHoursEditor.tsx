import { useState } from 'react';
import type { WorkingHour } from '../../types/database';
import { WEEKDAY_LABELS } from '../../types/database';
import { saveWorkingHours } from '../../services/singletonSectionService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';

function defaultHours(businessId: string, existing: WorkingHour[]): WorkingHour[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const found = existing.find((h) => h.weekday === weekday);
    return found ?? { id: `new-${weekday}`, business_id: businessId, weekday, is_open: true, open_time: '09:00', close_time: '18:00' };
  });
}

export default function WorkingHoursEditor({ businessId, hours, onSaved }: { businessId: string; hours: WorkingHour[]; onSaved: (h: WorkingHour[]) => void }) {
  const [rows, setRows] = useState<WorkingHour[]>(() => defaultHours(businessId, hours));
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function update(weekday: number, patch: Partial<WorkingHour>) {
    setRows((prev) => prev.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveWorkingHours(businessId, rows);
      onSaved(rows);
      showToast('Çalışma saatleri kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {rows.map((r) => (
        <div key={r.weekday} style={{ display: 'grid', gridTemplateColumns: '90px auto 1fr 1fr', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{WEEKDAY_LABELS[r.weekday]}</span>
          <Switch on={r.is_open} onChange={(v) => update(r.weekday, { is_open: v })} />
          <input type="time" disabled={!r.is_open} value={r.open_time ?? ''} onChange={(e) => update(r.weekday, { open_time: e.target.value })} />
          <input type="time" disabled={!r.is_open} value={r.close_time ?? ''} onChange={(e) => update(r.weekday, { close_time: e.target.value })} />
        </div>
      ))}
      <button className="btn btn-primary" style={{ justifySelf: 'start', marginTop: 6 }} disabled={saving} onClick={handleSave}>{saving ? <Spinner /> : 'Kaydet'}</button>
    </div>
  );
}
