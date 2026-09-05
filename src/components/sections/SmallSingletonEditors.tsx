import { useState } from 'react';
import type { Location, PaymentAccount, Appointment, ReviewLinks } from '../../types/database';
import { upsertLocation, upsertPayment, upsertAppointment, upsertReviews } from '../../services/singletonSectionService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';

export function LocationEditor({ businessId, location, onSaved }: { businessId: string; location: Location | null; onSaved: (l: Location) => void }) {
  const [address, setAddress] = useState(location?.address ?? '');
  const [city, setCity] = useState(location?.city ?? '');
  const [district, setDistrict] = useState(location?.district ?? '');
  const [mapsUrl, setMapsUrl] = useState(location?.maps_url ?? '');
  const [lat, setLat] = useState(location?.latitude?.toString() ?? '');
  const [lng, setLng] = useState(location?.longitude?.toString() ?? '');
  const [showMap, setShowMap] = useState(location?.show_map ?? true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Canlı harita URL'si: lat/lng varsa önce onu kullan, yoksa adres
  const fullAddress = [address, district, city].filter(Boolean).join(', ');
  const embedSrc = lat && lng
    ? `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : fullAddress
      ? `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
      : null;

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await upsertLocation(businessId, {
        address, city, district, maps_url: mapsUrl,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
        show_map: showMap,
      });
      onSaved(updated);
      showToast('Konum bilgileri kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  const googleUrl = mapsUrl || (fullAddress ? `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}` : '');
  const appleUrl = fullAddress ? `https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}` : '';
  const yandexUrl = fullAddress ? `https://yandex.com/maps/?text=${encodeURIComponent(fullAddress)}` : '';

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div><label>Adres</label><input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label>İl</label><input value={city} onChange={(e) => setCity(e.target.value)} /></div>
        <div><label>İlçe</label><input value={district} onChange={(e) => setDistrict(e.target.value)} /></div>
      </div>
      <div><label>Google Maps URL (opsiyonel, girilirse "Yol Tarifi" butonu buraya yönlendirir)</label><input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label>Enlem (Latitude)</label><input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="39.9000" /></div>
        <div><label>Boylam (Longitude)</label><input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="41.2700" /></div>
      </div>

      {/* Canlı Harita Önizleme */}
      {embedSrc && (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', padding: '8px 12px', background: '#F9FAFB', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🗺️ Canlı Harita Önizleme</span>
            <span style={{ fontSize: 10 }}>Müşteri sayfasında da bu şekilde görünür</span>
          </div>
          <iframe
            key={embedSrc}
            src={embedSrc}
            title="Konum Önizleme"
            width="100%"
            height="220"
            style={{ display: 'block', border: 'none' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Harita açma butonları */}
          {fullAddress && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: 10, background: '#F9FAFB' }}>
              <a href={googleUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textAlign: 'center', fontSize: 11 }}>🗺️ Google</a>
              <a href={appleUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textAlign: 'center', fontSize: 11 }}>🍎 Apple</a>
              <a href={yandexUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textAlign: 'center', fontSize: 11 }}>🅨 Yandex</a>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ margin: 0 }}>Canlı Haritayı Göster (müşteri sayfasında)</label>
        <Switch on={showMap} onChange={setShowMap} />
      </div>
      <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving} onClick={handleSave}>{saving ? <Spinner /> : 'Kaydet'}</button>
    </div>
  );
}

export function PaymentEditor({ businessId, payment, onSaved }: { businessId: string; payment: PaymentAccount | null; onSaved: (p: PaymentAccount) => void }) {
  const [bankName, setBankName] = useState(payment?.bank_name ?? '');
  const [accountHolder, setAccountHolder] = useState(payment?.account_holder ?? '');
  const [iban, setIban] = useState(payment?.iban ?? '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Anlık QR: IBAN her değiştiğinde yeni URL üret
  const cleanIban = iban.replace(/\s+/g, '').toUpperCase();
  const ibanQrUrl = cleanIban.length >= 10
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(cleanIban)}`
    : null;

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await upsertPayment(businessId, { bank_name: bankName, account_holder: accountHolder, iban: cleanIban });
      onSaved(updated);
      showToast('Ödeme bilgileri kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div><label>Banka</label><input value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>
      <div><label>Hesap Sahibi</label><input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} /></div>
      <div>
        <label>IBAN</label>
        <input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="TR330006100519786457841326" />
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Boşluksuz yazın — otomatik temizlenir. QR aşağıda anlık güncellenir.
        </div>
      </div>

      {/* Anlık QR Önizleme */}
      {ibanQrUrl && (
        <div style={{ background: '#F9FAFB', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            key={ibanQrUrl}
            src={ibanQrUrl}
            alt="IBAN QR"
            width={90}
            height={90}
            style={{ borderRadius: 8, border: '1px solid var(--color-border)', background: '#fff' }}
          />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>QR Kod Önizleme</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', wordBreak: 'break-all', maxWidth: 220 }}>
              {cleanIban}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 4 }}>
              ✓ Müşteri sayfasında büyütülebilir tam ekran QR görünür
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving} onClick={handleSave}>{saving ? <Spinner /> : 'Kaydet'}</button>
    </div>
  );
}

export function AppointmentEditor({ businessId, appointment, onSaved }: { businessId: string; appointment: Appointment | null; onSaved: (a: Appointment) => void }) {
  const [url, setUrl] = useState(appointment?.appointment_url ?? '');
  const [notes, setNotes] = useState(appointment?.notes ?? '');
  const [whatsappBooking, setWhatsappBooking] = useState(appointment?.whatsapp_booking ?? false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await upsertAppointment(businessId, url, notes, whatsappBooking);
      onSaved(updated);
      showToast('Randevu bilgileri kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div><label>Randevu URL</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
      <div><label>Not (buton altında gösterilir)</label><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hızlıca randevunuzu oluşturun" /></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ margin: 0 }}>WhatsApp ile randevu butonu göster</label>
        <Switch on={whatsappBooking} onChange={setWhatsappBooking} />
      </div>
      <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving} onClick={handleSave}>{saving ? <Spinner /> : 'Kaydet'}</button>
    </div>
  );
}

export function ReviewsEditor({ businessId, reviews, onSaved }: { businessId: string; reviews: ReviewLinks | null; onSaved: (r: ReviewLinks) => void }) {
  const [businessUrl, setBusinessUrl] = useState(reviews?.google_business_url ?? '');
  const [reviewUrl, setReviewUrl] = useState(reviews?.google_review_url ?? '');
  const [rating, setRating] = useState(reviews?.rating?.toString() ?? '');
  const [reviewCount, setReviewCount] = useState(reviews?.review_count?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await upsertReviews(businessId, {
        google_business_url: businessUrl, google_review_url: reviewUrl,
        rating: rating ? parseFloat(rating) : null,
        review_count: reviewCount ? parseInt(reviewCount, 10) : null,
      });
      onSaved(updated);
      showToast('Google bağlantıları kaydedildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div><label>Google İşletme URL</label><input value={businessUrl} onChange={(e) => setBusinessUrl(e.target.value)} /></div>
      <div><label>Google Yorum URL</label><input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label>Puan (örn. 4.8)</label><input value={rating} onChange={(e) => setRating(e.target.value)} placeholder="5.0" /></div>
        <div><label>Değerlendirme Sayısı</label><input value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} placeholder="10" /></div>
      </div>
      <button className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving} onClick={handleSave}>{saving ? <Spinner /> : 'Kaydet'}</button>
    </div>
  );
}
