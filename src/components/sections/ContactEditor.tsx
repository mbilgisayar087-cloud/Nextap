import { useState } from 'react';
import type { Contact } from '../../types/database';
import { upsertContact } from '../../services/singletonSectionService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner } from '../ui/Primitives';
import { Switch } from '../ui/Primitives';

export default function ContactEditor({ businessId, contact, onSaved }: { businessId: string; contact: Contact | null; onSaved: (c: Contact) => void }) {
  const [phone, setPhone] = useState(contact?.phone ?? '');
  const [phoneActive, setPhoneActive] = useState(contact?.phone_active ?? true);
  const [phoneDisplay, setPhoneDisplay] = useState(contact?.phone_display ?? '');
  const [whatsapp, setWhatsapp] = useState(contact?.whatsapp ?? '');
  const [whatsappActive, setWhatsappActive] = useState(contact?.whatsapp_active ?? true);
  const [whatsappMsg, setWhatsappMsg] = useState(contact?.whatsapp_prefilled_message ?? '');
  const [email, setEmail] = useState(contact?.email ?? '');
  const [emailActive, setEmailActive] = useState(contact?.email_active ?? true);
  const [sms, setSms] = useState(contact?.sms ?? '');
  const [smsActive, setSmsActive] = useState(contact?.sms_active ?? true);
  const [smsMsg, setSmsMsg] = useState(contact?.sms_prefilled_message ?? '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await upsertContact(businessId, {
        phone, phone_active: phoneActive, phone_display: phoneDisplay || null,
        whatsapp, whatsapp_active: whatsappActive, whatsapp_prefilled_message: whatsappMsg || null,
        email, email_active: emailActive,
        sms, sms_active: smsActive, sms_prefilled_message: smsMsg || null,
      });
      onSaved(updated);
      showToast('İletişim bilgileri kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  // --- Rehber (Contact Picker) Entegrasyonu ---
  // navigator.contacts: Android Chrome 80+, Windows Chrome 86+, Samsung Internet 13+
  // iOS Safari: HENÜZ DESTEKLEMİYOR
  async function pickFromContacts() {
    // @ts-ignore - Contact Picker API TypeScript tanımları henüz tam değil
    const contactsApi = navigator.contacts;
    if (!contactsApi) {
      showToast('Tarayıcınız rehber erişimini desteklemiyor. Lütfen bilgileri manuel girin. (Android Chrome gerekli)', 'error');
      return;
    }
    try {
      // @ts-ignore
      const contacts = await contactsApi.select(['name', 'tel', 'email'], { multiple: false });
      if (!contacts || contacts.length === 0) return;
      const c = contacts[0];
      if (c.name && c.name[0]) showToast(`Kişi: ${c.name[0]}`);
      if (c.tel && c.tel[0]) {
        const cleanPhone = c.tel[0].replace(/\D/g, '');
        setPhone(cleanPhone);
        setWhatsapp(cleanPhone);
        showToast('Telefon numarası rehberden alındı.');
      }
      if (c.email && c.email[0]) setEmail(c.email[0]);
    } catch (err) {
      showToast('Rehber erişimi reddedildi veya izin verilmedi.', 'error');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Rehberden seçme butonu */}
      <div style={{ background: '#EEF2FF', border: '1px dashed #818CF8', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📇</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#4338CA' }}>Telefon Rehberinden Aktar</div>
            <div style={{ fontSize: 11, color: '#6366F1' }}>Kişi seç → Telefon ve WhatsApp otomatik dolar</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ background: '#4338CA', color: '#fff', border: 'none' }} onClick={pickFromContacts}>
            📇 Rehberden Seç
          </button>
          <span style={{ fontSize: 11, color: '#818CF8' }}>⚠️ Android Chrome'da çalışır</span>
        </div>
      </div>

      <FieldRow label="Telefon" active={phoneActive} onToggle={setPhoneActive}>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" />
        <input style={{ marginTop: 6 }} value={phoneDisplay} onChange={(e) => setPhoneDisplay(e.target.value)} placeholder="Görüntülenecek metin (opsiyonel, örn. 0552 xxx xx xx)" />
      </FieldRow>
      <FieldRow label="WhatsApp" active={whatsappActive} onToggle={setWhatsappActive}>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+90 5xx xxx xx xx" />
        <input style={{ marginTop: 6 }} value={whatsappMsg} onChange={(e) => setWhatsappMsg(e.target.value)} placeholder="Ön yazılı mesaj (örn. Merhaba, bilgi almak istiyorum.)" />
      </FieldRow>
      <FieldRow label="SMS" active={smsActive} onToggle={setSmsActive}>
        <input value={sms} onChange={(e) => setSms(e.target.value)} placeholder="+90 5xx xxx xx xx" />
        <input style={{ marginTop: 6 }} value={smsMsg} onChange={(e) => setSmsMsg(e.target.value)} placeholder="Ön yazılı SMS metni (opsiyonel)" />
      </FieldRow>
      <FieldRow label="E-posta" active={emailActive} onToggle={setEmailActive}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@isletme.com" />
      </FieldRow>
      <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving} onClick={handleSave}>
        {saving ? <Spinner /> : 'Kaydet'}
      </button>
    </div>
  );
}

function FieldRow({ label, active, onToggle, children }: { label: string; active: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ margin: 0 }}>{label}</label>
        <Switch on={active} onChange={onToggle} />
      </div>
      {children}
    </div>
  );
}
