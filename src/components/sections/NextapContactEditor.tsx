import { useEffect, useState } from 'react';
import { getNextapContact, saveNextapContact, type NextapContact } from '../../services/nextapContactService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner } from '../ui/Primitives';

export default function NextapContactEditor() {
  const [data, setData]     = useState<NextapContact | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast }       = useToast();

  useEffect(() => {
    getNextapContact().then(setData);
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    try {
      await saveNextapContact(data);
      showToast('NexTap iletişim bilgileri kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err, 'Kaydedilemedi.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div style={{ padding: 20, textAlign: 'center' }}><Spinner dark /></div>;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', borderRadius: 12, padding: 14, marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Bu bilgiler her işletme sayfasının altında <strong>NexTap iletişim kartı</strong> olarak gösterilir.
          Müşteriler buradan size ulaşır ve kart talep eder.
        </p>
      </div>

      <div>
        <label>📢 Reklam Sloganı</label>
        <textarea rows={2} value={data.slogan} onChange={e => setData({ ...data, slogan: e.target.value })}
          placeholder="Bir dokunuşta tüm bilgileriniz..." style={{ resize: 'vertical' }} />
      </div>
      <div>
        <label>📞 Telefon Numarası</label>
        <input value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} placeholder="+905528134370" />
      </div>
      <div>
        <label>💬 WhatsApp Numarası</label>
        <input value={data.whatsapp} onChange={e => setData({ ...data, whatsapp: e.target.value })} placeholder="+905528134370" />
      </div>
      <div>
        <label>📸 Instagram URL</label>
        <input value={data.instagram} onChange={e => setData({ ...data, instagram: e.target.value })} placeholder="https://instagram.com/nextap" />
      </div>

      {/* Önizleme */}
      <div style={{ background: '#111', borderRadius: 16, padding: 20, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Müşteri Sayfasındaki Görünüm
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14, fontStyle: 'italic' }}>"{data.slogan}"</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <a href={`tel:${data.phone}`} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>📞 Ara</a>
          <a href={`https://wa.me/${data.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>💬 WhatsApp</a>
          <a href={data.instagram} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>📸 Instagram</a>
        </div>
      </div>

      <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving} onClick={handleSave}>
        {saving ? <Spinner /> : 'Kaydet'}
      </button>
    </div>
  );
}
