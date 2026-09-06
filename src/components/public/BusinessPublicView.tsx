import { useState } from 'react';
import {
  Phone, MessageCircle, Navigation, MessageSquare, Star, Globe,
  Copy, Check,
  CreditCard, QrCode, Calendar, Clock, Utensils, Tag, AlertCircle,
  FileText, Camera, ChevronRight, X, ChevronLeft, ExternalLink, Share2,
  Sparkles, ShieldCheck, Download, ArrowUpRight, Maximize2, MapPin,
} from 'lucide-react';
import { getPlatformDef, PlatformIcon } from '../../lib/socialPlatforms';
import type { BusinessFull } from '../../types/database';
import { toLegacyBusiness } from '../../lib/legacyBusinessAdapter';
import { downloadVCard } from '../../lib/vcard';
import { NexTapPublicCard } from './NexTapContactCard';

interface BusinessPublicViewProps {
  data: BusinessFull;
  cardCode?: string | null;
  onBackToPanel?: () => void;
  showPanelNav?: boolean;
}

export default function BusinessPublicView({ data, cardCode = null, onBackToPanel, showPanelNav = false }: BusinessPublicViewProps) {
  const business = toLegacyBusiness(data, cardCode);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showFullscreenIbanQr, setShowFullscreenIbanQr] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Open / Closed Status Calculation
  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todaySchedule = business.workingHours.find((h) => h.dayIndex === currentDayIndex);

  let isOpenNow = false;
  let statusText = 'Kapalı';
  let nextStatus = '';

  if (todaySchedule && !todaySchedule.isClosed) {
    const [openH, openM] = (todaySchedule.openTime || '09:00').split(':').map(Number);
    const [closeH, closeM] = (todaySchedule.closeTime || '22:00').split(':').map(Number);
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;

    if (currentMinutes >= openMin && currentMinutes < closeMin) {
      isOpenNow = true;
      statusText = 'Şu an Açık';
      nextStatus = `Kapanış: ${todaySchedule.closeTime}`;
    } else {
      statusText = 'Şu an Kapalı';
      nextStatus = currentMinutes < openMin ? `Açılış: ${todaySchedule.openTime}` : 'Yarın açılacak';
    }
  } else {
    statusText = 'Şu an Kapalı';
    nextStatus = 'Bugün Kapalı';
  }

  const isContactEnabled = business.contactEnabled && business.contact.enabled;
  const isLocationEnabled = business.locationEnabled && business.location?.enabled !== false;
  const isSocialEnabled = business.socialMediaEnabled;
  const isPaymentEnabled = business.paymentEnabled;
  const isWorkingHoursEnabled = business.workingHoursEnabled;
  const isServicesEnabled = business.servicesEnabled;
  const isCampaignsEnabled = business.campaignsEnabled;
  const isGoogleEnabled = business.googleEnabled;
  const isGalleryEnabled = business.galleryEnabled;
  const isAppointmentEnabled = business.appointmentEnabled;
  const isAnnouncementsEnabled = business.announcementsEnabled;
  const isDocumentsEnabled = business.documentsEnabled;

  const activeSocials = isSocialEnabled ? business.socialMedia.filter((s) => s.active && s.url) : [];
  const activeServices = isServicesEnabled ? business.services.filter((s) => s.active) : [];
  const activeCampaigns = isCampaignsEnabled ? business.campaigns.filter((c) => c.active) : [];
  const activeAnnouncements = isAnnouncementsEnabled ? business.announcements.filter((a) => a.active) : [];
  const activeGallery = isGalleryEnabled ? business.gallery.filter((g) => g.active) : [];
  const activeDocuments = isDocumentsEnabled ? business.documents.filter((d) => d.active) : [];

  const hasPhone = isContactEnabled && business.contact.phone.active && business.contact.phone.value;
  const hasWhatsApp = isContactEnabled && business.contact.whatsapp.active && business.contact.whatsapp.value;
  const hasMaps = isLocationEnabled && (business.location?.mapsUrl || business.location?.address);
  const hasLiveMap = hasMaps && business.location?.showMap;
  const hasSms = isContactEnabled && business.contact.sms.active && business.contact.sms.value;
  const hasEmail = isContactEnabled && business.contact.email.active && business.contact.email.value;

  const whatsappUrl = hasWhatsApp
    ? `https://wa.me/${business.contact.whatsapp.value!.replace(/\D/g, '')}?text=${encodeURIComponent(business.contact.whatsapp.prefilledMessage || 'Merhaba, bilgi almak istiyorum.')}`
    : '';

  const smsUrl = hasSms
    ? `sms:${business.contact.sms.value}?body=${encodeURIComponent(business.contact.sms.prefilledMessage || '')}`
    : '';

  const fullAddressString = `${business.location?.address || ''} ${business.location?.district || ''} ${business.location?.city || ''}`.trim();
  const mapsUrl = business.location?.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(fullAddressString || business.name)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(fullAddressString || business.name)}`;
  const yandexMapsUrl = `https://yandex.com/maps/?text=${encodeURIComponent(fullAddressString || business.name)}`;
  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddressString || business.name)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleCopyIban = async () => {
    if (!business.payment?.iban) return;
    const cleanIban = business.payment.iban.replace(/\s+/g, '');
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(cleanIban);
      setCopiedIban(true);
      showToast('IBAN panoya kopyalandı');
      setTimeout(() => setCopiedIban(false), 2000);
    } catch {
      showToast('Kopyalama başarısız oldu');
    }
  };

  const handleSaveContact = () => {
    downloadVCard(business);
    showToast('Rehber kartı (.vcf) indirildi');
  };

  const handleShareCard = async () => {
    const shareData = {
      title: business.name,
      text: `${business.name} - ${business.tagline || 'Dijital İşletme Kartı'}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Kart linki kopyalandı');
      } catch {
        showToast('Link kopyalanamadı');
      }
    }
  };

  // getSocialIcon replaced by PlatformIcon from socialPlatforms

  const rawIban = (business.payment?.iban || '').replace(/\s+/g, '');
  const ibanQrPayload = rawIban.startsWith('TR') ? rawIban : `TR${rawIban}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(ibanQrPayload)}`;

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-start p-2 sm:py-6 sm:px-4 text-slate-900 font-sans pb-24 sm:pb-8">
      {showPanelNav && (
        <div className="w-full max-w-md bg-slate-900 text-white px-4 py-2.5 rounded-t-2xl sm:rounded-2xl mb-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold">NFC Kart Önizleme</span>
            {business.nfcCardId && (
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">
                {business.nfcCardId}
              </span>
            )}
          </div>
          {onBackToPanel && (
            <button
              onClick={onBackToPanel}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg transition-colors active:scale-95"
            >
              ← Panele Dön
            </button>
          )}
        </div>
      )}

      <main className="w-full max-w-md bg-white sm:rounded-3xl sm:shadow-xl sm:border sm:border-slate-200/80 overflow-hidden flex flex-col relative">
        {business.coverUrl ? (
          <div className="relative w-full h-36 sm:h-40 bg-slate-900 overflow-hidden">
            <img src={business.coverUrl} alt={business.name} className="w-full h-full object-cover opacity-85" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            {business.nfcCardId && (
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-mono flex items-center gap-1 border border-white/20">
                <span>NFC:</span>
                <span className="font-bold text-amber-300">{business.nfcCardId}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-24 bg-gradient-to-r from-slate-900 to-amber-900" />
        )}

        <header className="relative px-5 pt-0 pb-4 text-center -mt-12">
          <div className="relative inline-block mx-auto mb-3">
            <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-2xl p-1 bg-white shadow-lg border border-slate-200 overflow-hidden">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-slate-900 text-white font-black text-2xl flex items-center justify-center rounded-xl">
                  {business.name.slice(0, 2).toUpperCase() || 'NC'}
                </div>
              )}
            </div>
            {business.isActive && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-sm border-2 border-white" title="Doğrulanmış İşletme">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {business.name || 'İşletme Adı'}
          </h1>
          {business.categoryName && (
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-1">{business.categoryName}</p>
          )}

          {business.tagline && (
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-1.5 italic px-2">"{business.tagline}"</p>
          )}

          {isWorkingHoursEnabled && (
            <div className="mt-3 flex items-center justify-center">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isOpenNow ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{statusText}</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="font-normal text-slate-600">{nextStatus}</span>
              </div>
            </div>
          )}
        </header>

        {isContactEnabled && (hasPhone || hasWhatsApp || hasMaps || hasSms) && (
          <section className="px-4 my-2" aria-label="Ana İletişim Butonları">
            <div className={`grid gap-2.5 ${(Number(!!hasPhone) + Number(!!hasWhatsApp) + Number(!!hasMaps) + Number(!!hasSms)) >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {hasPhone && (
                <a href={`tel:${business.contact.phone.value}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 text-white font-semibold shadow-md active:scale-95 transition-all hover:bg-slate-800 text-center touch-manipulation">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-1 text-white">
                    <Phone className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">ARA</span>
                  <span className="text-[10px] text-slate-300 font-normal truncate max-w-full px-1">
                    {business.contact.phone.display || business.contact.phone.value}
                  </span>
                </a>
              )}

              {hasWhatsApp && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#25D366] text-white font-semibold shadow-md active:scale-95 transition-all hover:bg-[#20ba5a] text-center touch-manipulation">
                  <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center mb-1 text-white">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">WHATSAPP</span>
                  <span className="text-[10px] text-emerald-100 font-normal">Mesaj Gönder</span>
                </a>
              )}

              {hasMaps && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-600 text-white font-semibold shadow-md active:scale-95 transition-all hover:bg-amber-700 text-center touch-manipulation">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-1 text-white">
                    <Navigation className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">YOL TARİFİ</span>
                  <span className="text-[10px] text-amber-100 font-normal">Haritada Aç</span>
                </a>
              )}

              {hasSms && !hasMaps && (
                <a href={smsUrl} className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-blue-600 text-white font-semibold shadow-md active:scale-95 transition-all text-center touch-manipulation">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-1 text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">SMS</span>
                  <span className="text-[10px] text-blue-100 font-normal">SMS Gönder</span>
                </a>
              )}
            </div>
          </section>
        )}

        <section className="px-4 my-2" aria-label="Hızlı İşlemler">
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={handleSaveContact} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all text-left touch-manipulation">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate">Rehbere Ekle</span>
                <span className="block text-[10px] text-slate-500 truncate">Kişilere kaydet (.vcf)</span>
              </div>
            </button>

            <button type="button" onClick={handleShareCard} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all text-left touch-manipulation">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate">Kartı Paylaş</span>
                <span className="block text-[10px] text-slate-500 truncate">WhatsApp / Link</span>
              </div>
            </button>

            {isGoogleEnabled && business.google?.enabled && business.google?.reviewUrl && (
              <a href={business.google.reviewUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 shadow-2xs hover:bg-amber-100/70 active:scale-95 transition-all touch-manipulation">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-900 truncate">Google İşletme Yorumu Bırakın</span>
                    <span className="block text-[10px] text-amber-800 font-semibold">
                      ★ {business.google.rating || 5.0} / 5.0 ({business.google.reviewCount || 10}+ Değerlendirme)
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-800 shrink-0" />
              </a>
            )}

            {hasEmail && (
              <a href={`mailto:${business.contact.email.value}`} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all text-left touch-manipulation">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 truncate">E-posta Gönder</span>
                  <span className="block text-[10px] text-slate-500 truncate">{business.contact.email.value}</span>
                </div>
              </a>
            )}
          </div>
        </section>

        {isSocialEnabled && activeSocials.length > 0 && (
          <section className="px-4 my-2" aria-label="Sosyal Medya">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-1">Sosyal Medya & Web</div>
              <div className="flex flex-wrap gap-2">
                {activeSocials.map((social) => {
                  const pDef = getPlatformDef(social.platform);
                  return (
                    <a
                      key={social.id}
                      href={social.url.startsWith('http') ? social.url : `https://${social.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-2xs active:scale-95 transition-all touch-manipulation"
                      style={{ background: '#fff' }}
                    >
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: pDef.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PlatformIcon value={social.platform} size={12} />
                      </div>
                      <span>{social.title || pDef.label}</span>
                      {social.username && <span className="text-[10px] text-slate-400 font-normal">({social.username})</span>}
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {isAppointmentEnabled && business.appointment?.enabled && (
          <section className="px-4 my-3" aria-label="Randevu">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight">RANDEVU & REZERVASYON</h2>
                    <p className="text-[11px] text-amber-100">{business.appointment.notes || 'Hızlıca randevunuzu oluşturun'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {business.appointment.appointmentUrl && (
                  <a href={business.appointment.appointmentUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-100 active:scale-95 transition-all touch-manipulation">
                    <span>Online Randevu</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                  </a>
                )}
                {business.appointment.whatsappBooking && hasWhatsApp && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 active:scale-95 transition-all touch-manipulation">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp ile</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {isPaymentEnabled && business.payment?.enabled && business.payment?.iban && (
          <section className="px-4 my-3" aria-label="Ödeme Bilgileri">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">ÖDEME & IBAN BİLGİSİ</h2>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">FAST / Havale / EFT</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Banka Adı:</span>
                  <span className="font-bold text-slate-900">{business.payment.bankName || 'Banka'} {business.payment.branchName ? `(${business.payment.branchName})` : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Hesap Sahibi:</span>
                  <span className="font-semibold text-slate-900">{business.payment.accountHolder}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">IBAN NUMARASI</span>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs sm:text-sm font-bold tracking-wider text-slate-900 break-all select-all flex items-center justify-between gap-2">
                  <span>{business.payment.iban}</span>
                  <button type="button" onClick={handleCopyIban} className={`shrink-0 p-1.5 rounded-lg text-xs font-bold transition-all ${copiedIban ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`} title="Kopyala">
                    {copiedIban ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <div onClick={() => setShowFullscreenIbanQr(true)} className="group relative cursor-pointer bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 transition-all active:scale-98 shadow-sm touch-manipulation">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-16 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                      <img src={qrImageUrl} alt="IBAN QR" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
                        <QrCode className="w-4 h-4" />
                        <span>KAREKOD İLE HIZLI ÖDE</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">Mobil bankacılıkta QR okutmak için dokunun</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold mt-1 underline">
                        <Maximize2 className="w-3 h-3" />
                        <span>Tam Ekran Büyüt</span>
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={handleCopyIban} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm touch-manipulation ${copiedIban ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  {copiedIban ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedIban ? 'IBAN KOPYALANDI ✓' : 'IBAN KOPYALA'}</span>
                </button>
                <button type="button" onClick={() => setShowFullscreenIbanQr(true)} className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all touch-manipulation">
                  <QrCode className="w-4 h-4" />
                  <span>QR Büyüt</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {activeServices.length > 0 && (
          <section className="px-4 my-3" aria-label="Hizmetler">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">HİZMETLER & MENÜ</h2>
              </div>
              <span className="text-[11px] text-slate-500">{activeServices.length} Seçenek</span>
            </div>

            <div className="space-y-2">
              {activeServices.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl border border-slate-200/90 p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
                  {service.image && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-slate-900 truncate">{service.name}</h3>
                      {service.tag && <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">{service.tag}</span>}
                    </div>
                    {service.description && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{service.description}</p>}
                  </div>
                  {service.price != null && service.price > 0 && (
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-amber-600">{service.price} {service.currency || 'TL'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeCampaigns.length > 0 && (
          <section className="px-4 my-3" aria-label="Kampanyalar">
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <Tag className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">ÖZEL FIRSATLAR & KAMPANYALAR</h2>
            </div>

            <div className="space-y-2.5">
              {activeCampaigns.map((camp) => (
                <div key={camp.id} className="bg-linear-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-3.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-rose-600 text-white rounded-md inline-block mb-1">{camp.badge || 'Kampanya'}</span>
                      <h3 className="font-bold text-xs text-slate-900">{camp.title}</h3>
                      <p className="text-[11px] text-slate-600 mt-0.5">{camp.description}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-rose-200/60 flex items-center justify-between text-xs">
                    {camp.couponCode && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold">Kupon:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(camp.couponCode!);
                            setCopiedCode(camp.couponCode!);
                            showToast(`"${camp.couponCode}" kodu kopyalandı`);
                            setTimeout(() => setCopiedCode(null), 2000);
                          }}
                          className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <span>{camp.couponCode}</span>
                          {copiedCode === camp.couponCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                    {camp.validUntil && <span className="text-[10px] text-slate-500">Son gün: {camp.validUntil}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeAnnouncements.length > 0 && (
          <section className="px-4 my-3" aria-label="Duyurular">
            <div className="flex items-center gap-2 mb-2 px-1">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">GÜNCEL DUYURULAR</h2>
            </div>
            <div className="space-y-2">
              {activeAnnouncements.map((ann) => (
                <div key={ann.id} className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950">{ann.title}</span>
                    {ann.date && <span className="text-[10px] text-blue-600">{ann.date}</span>}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{ann.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isWorkingHoursEnabled && business.workingHours.length > 0 && (
          <section className="px-4 my-3" aria-label="Çalışma Saatleri">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 mb-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">ÇALIŞMA SAATLERİ</h2>
              </div>
              <div className="space-y-1.5 text-xs">
                {business.workingHours.map((item) => {
                  const isToday = item.dayIndex === currentDayIndex;
                  return (
                    <div key={item.dayIndex} className={`flex items-center justify-between py-1 px-2 rounded-lg ${isToday ? 'bg-amber-50 font-bold text-amber-950' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-1.5">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        <span>{item.dayName}</span>
                      </div>
                      <div>
                        {item.isClosed ? (
                          <span className="text-rose-600 font-bold">Kapalı</span>
                        ) : (
                          <span className={isToday ? 'font-bold text-slate-900' : 'text-slate-600'}>{item.openTime} - {item.closeTime}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeDocuments.length > 0 && (
          <section className="px-4 my-3" aria-label="Dosyalar">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">MENÜ & KATALOGLAR</h2>
              </div>
              <div className="space-y-2">
                {activeDocuments.map((doc) => (
                  <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 truncate">{doc.title}</span>
                        <span className="block text-[10px] text-slate-500 uppercase">{doc.type} {doc.fileSize ? `• ${doc.fileSize}` : ''}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeGallery.length > 0 && (
          <section className="px-4 my-3" aria-label="Galeri">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">FOTOĞRAF GALERİSİ</h2>
              </div>
              <span className="text-[11px] text-slate-500">{activeGallery.length} Fotoğraf</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeGallery.map((photo, idx) => (
                <button key={photo.id} type="button" onClick={() => setLightboxIndex(idx)} className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 text-left active:scale-95 transition-all touch-manipulation">
                  <img src={photo.imageUrl} alt={photo.title ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[11px] text-white font-medium truncate">{photo.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {isLocationEnabled && business.location?.address && (
          <section className="px-4 my-3" aria-label="Adres & Canlı Harita">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">ADRES & CANLI HARİTA</h2>
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Canlı Konum</span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 leading-snug">{business.location.address}</p>
                {(business.location.district || business.location.city) && (
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {business.location.district} {business.location.district && business.location.city ? ' / ' : ''} {business.location.city}
                  </p>
                )}
              </div>

              {hasLiveMap && (
                <div className="space-y-2.5 pt-1">
                  <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                    <iframe title="İşletme Canlı Harita Konumu" src={embedMapUrl} className="w-full h-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all text-center touch-manipulation">
                      <Navigation className="w-4 h-4 text-amber-400 mb-0.5" />
                      <span>Google Harita</span>
                    </a>
                    <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 shadow-xs active:scale-95 transition-all text-center touch-manipulation">
                      <MapPin className="w-4 h-4 text-rose-600 mb-0.5" />
                      <span>Apple Harita</span>
                    </a>
                    <a href={yandexMapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[11px] border border-amber-200 shadow-xs active:scale-95 transition-all text-center touch-manipulation">
                      <ExternalLink className="w-4 h-4 text-amber-600 mb-0.5" />
                      <span>Yandex</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-4 pt-4 border-t border-slate-100 pb-24 sm:pb-2 px-0">
          {/* Kurucudan iletişim - Yeni tasarım */}
          <div className="-mx-4">
            <NexTapPublicCard business={business} />
          </div>

          <div className="text-center pb-2 px-4">
            <p className="font-black text-xs tracking-widest text-slate-400 uppercase">NexTap</p>
            <p className="text-[10px] tracking-wide text-slate-400">Dijital NFC İşletme Kartı Platformu</p>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 sm:hidden shadow-lg flex items-center justify-around gap-1 max-w-md mx-auto">
        {hasPhone && (
          <a href={`tel:${business.contact.phone.value}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-700 hover:text-slate-950 active:scale-90 transition-all p-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Phone className="w-4 h-4" />
            </div>
            <span className="mt-0.5">Ara</span>
          </a>
        )}

        {hasWhatsApp && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-[10px] font-bold text-[#25D366] hover:text-emerald-700 active:scale-90 transition-all p-1">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="mt-0.5">WhatsApp</span>
          </a>
        )}

        {hasMaps && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center text-[10px] font-bold text-amber-700 hover:text-amber-800 active:scale-90 transition-all p-1">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Navigation className="w-4 h-4" />
            </div>
            <span className="mt-0.5">Harita</span>
          </a>
        )}

        {isPaymentEnabled && business.payment?.enabled && business.payment?.iban && (
          <button type="button" onClick={() => setShowFullscreenIbanQr(true)} className="flex flex-col items-center justify-center text-[10px] font-bold text-emerald-700 hover:text-emerald-800 active:scale-90 transition-all p-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="mt-0.5">IBAN QR</span>
          </button>
        )}

        <button type="button" onClick={handleSaveContact} className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-700 hover:text-slate-900 active:scale-90 transition-all p-1">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="mt-0.5">Kaydet</span>
        </button>

        <button type="button" onClick={handleShareCard} className="flex flex-col items-center justify-center text-[10px] font-bold text-blue-700 hover:text-blue-900 active:scale-90 transition-all p-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="mt-0.5">Paylaş</span>
        </button>
      </div>

      {showFullscreenIbanQr && business.payment && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowFullscreenIbanQr(false)}>
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setShowFullscreenIbanQr(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors active:scale-90" title="Kapat">
              <X className="w-5 h-5" />
            </button>

            <div className="pt-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 font-display">{business.payment.bankName || 'BANKA HESABI'}</h3>
              <p className="text-xs font-semibold text-slate-600">{business.payment.accountHolder}</p>
            </div>

            <div className="p-4 bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl inline-block shadow-inner">
              <img src={qrImageUrl} alt="Büyük IBAN QR Kodu" className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl bg-white p-2 shadow-sm" />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Mobil bankacılık uygulamanızdan <span className="font-bold text-slate-800">"Karekod ile Transfer"</span> seçeneğini açıp bu ekranı okutabilirsiniz.
            </p>

            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 break-all select-all">{business.payment.iban}</div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleCopyIban} className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${copiedIban ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                {copiedIban ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedIban ? 'KOPYALANDI ✓' : 'IBAN KOPYALA'}</span>
              </button>
              <button type="button" onClick={() => setShowFullscreenIbanQr(false)} className="py-3 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl active:scale-95 transition-all">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {lightboxIndex !== null && activeGallery[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button type="button" onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white">
            <X className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + activeGallery.length) % activeGallery.length); }}
            className="absolute left-3 p-2 rounded-full bg-white/20 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="max-w-md max-h-[80vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={activeGallery[lightboxIndex].imageUrl} alt={activeGallery[lightboxIndex].title ?? ''} className="max-h-[70vh] object-contain rounded-xl" referrerPolicy="no-referrer" />
            <p className="text-white text-xs font-bold mt-2">{activeGallery[lightboxIndex].title}</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % activeGallery.length); }}
            className="absolute right-3 p-2 rounded-full bg-white/20 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl border border-slate-700 animate-in fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
