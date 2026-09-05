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

  return (
    <div style={{ display: 'grid', gap: 14 }}>
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
