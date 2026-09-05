import { useState } from 'react';
import type { Business } from '../../types/database';
import { updateBusiness } from '../../services/businessService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner } from '../ui/Primitives';

const THEMES: Array<{ value: Business['theme']; label: string }> = [
  { value: 'sade', label: 'Sade' },
  { value: 'modern', label: 'Modern' },
  { value: 'koyu', label: 'Koyu' },
  { value: 'minimal', label: 'Minimal' },
];

export default function AppearanceEditor({ business, onSaved }: { business: Business; onSaved: (b: Business) => void }) {
  const [theme, setTheme] = useState(business.theme);
  const [primary, setPrimary] = useState(business.primary_color);
  const [button, setButton] = useState(business.button_color);
  const [bg, setBg] = useState(business.background_color);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateBusiness(business.id, { theme, primary_color: primary, button_color: button, background_color: bg });
      onSaved(updated);
      showToast('Görünüm ayarları kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <h3 style={{ fontSize: 15, marginBottom: 14 }}>🎨 Görünüm</h3>
      <div style={{ marginBottom: 12 }}>
        <label>Tema</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value as Business['theme'])}>
          {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        <ColorField label="Ana Renk" value={primary} onChange={setPrimary} />
        <ColorField label="Buton" value={button} onChange={setButton} />
        <ColorField label="Arka Plan" value={bg} onChange={setBg} />
      </div>
      <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleSave}>{saving ? <Spinner /> : 'Kaydet'}</button>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ fontSize: 11 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 32, height: 32, padding: 0, border: 'none' }} />
        <input value={value} onChange={(e) => onChange(e.target.value)} style={{ fontSize: 12 }} />
      </div>
    </div>
  );
}
