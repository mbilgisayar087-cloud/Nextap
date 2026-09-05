import { useState } from 'react';
import type { Business } from '../../types/database';
import { updateBusiness, uploadBusinessAsset } from '../../services/businessService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner } from '../ui/Primitives';

export default function BusinessInfoEditor({ business, onSaved }: { business: Business; onSaved: (b: Business) => void }) {
  const [name, setName] = useState(business.name);
  const [tagline, setTagline] = useState(business.tagline ?? '');
  const [shortDesc, setShortDesc] = useState(business.short_description ?? '');
  const [longDesc, setLongDesc] = useState(business.long_description ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);
  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateBusiness(business.id, { name, tagline, short_description: shortDesc, long_description: longDesc });
      onSaved(updated);
      showToast('İşletme bilgileri kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(kind: 'logo' | 'cover', file: File) {
    setUploading(kind);
    try {
      const url = await uploadBusinessAsset(business.id, file, kind);
      const updated = await updateBusiness(business.id, kind === 'logo' ? { logo_url: url } : { cover_url: url });
      onSaved(updated);
      showToast(kind === 'logo' ? 'Logo yüklendi.' : 'Kapak fotoğrafı yüklendi.');
    } catch (err) {
      showToast(friendlyError(err, 'Fotoğraf yüklenemedi.'), 'error');
    } finally {
      setUploading(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div>
          <label>Logo</label>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 6 }}>
            {business.logo_url ? <img src={business.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏢'}
          </div>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            {uploading === 'logo' ? <Spinner dark /> : 'Yükle'}
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload('logo', e.target.files[0])} />
          </label>
        </div>
        <div>
          <label>Kapak Fotoğrafı</label>
          <div style={{ width: 110, height: 64, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 6 }}>
            {business.cover_url ? <img src={business.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🖼️'}
          </div>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            {uploading === 'cover' ? <Spinner dark /> : 'Yükle'}
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload('cover', e.target.files[0])} />
          </label>
        </div>
      </div>
      <div>
        <label>İşletme Adı</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Slogan (isim altında gösterilir)</label>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Örn. Geleneksel lezzetler ve kaliteli hizmet." />
      </div>
      <div>
        <label>Kısa Açıklama</label>
        <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Örn. Erzurum'un en lezzetli kebapçısı" />
      </div>
      <div>
        <label>Detaylı Açıklama</label>
        <textarea rows={3} value={longDesc} onChange={(e) => setLongDesc(e.target.value)} />
      </div>
      <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving} onClick={handleSave}>
        {saving ? <Spinner /> : 'Kaydet'}
      </button>
    </div>
  );
}
