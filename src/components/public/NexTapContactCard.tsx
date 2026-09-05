import { useState, useEffect } from 'react';
import type { LegacyBusiness } from '../../lib/legacyBusinessAdapter';
import { downloadVCard } from '../../lib/vcard';

const STORAGE_KEY = 'nextap_contact_card_v3';

export interface NexTapContactData {
  ownerName: string;
  ownerTitle: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  slogan: string;
  extraLinks: Array<{ label: string; url: string }>;
}

const DEFAULTS: NexTapContactData = {
  ownerName: 'Devran Mete',
  ownerTitle: 'NexTap Kurucu',
  phone: '05528134370',
  whatsapp: '905528134370',
  instagram: 'nextap',
  slogan: 'Sen de dijital NFC kartına sahip ol. Bir dokunuşta işleteni tanıt.',
  extraLinks: [],
};

export function getNexTapContact(): NexTapContactData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function saveNexTapContact(data: NexTapContactData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Responsive boyut hesaplayıcı ─────────────────────
// Container genişliğine göre orantılı boyutlandırma yapar
function useResponsiveSize() {
  const [containerWidth, setContainerWidth] = useState(390);

  useEffect(() => {
    const update = () => {
      // Sayfa container genişliğini ölç (mobil cihazda 375-430px arası)
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        // Mobilde ekran genişliği - 20px kenar boşluğu
        setContainerWidth(Math.min(window.innerWidth - 20, 430));
      } else {
        // Masaüstünde 430px sabit
        setContainerWidth(430);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Orantılı boyutlar
  const scale = containerWidth / 390; // 390 referans genişlik
  return {
    cardPadding: 10 * scale,
    cardRadius: 20 * scale,
    headerPadding: 18 * scale,
    headerRadius: 14 * scale,
    iconSize: 40 * scale,
    iconRadius: 12 * scale,
    iconTextSize: 10 * scale,
    iconSubTextSize: 9 * scale,
    avatarSize: 40 * scale,
    nameFontSize: 14 * scale,
    titleFontSize: 11 * scale,
    badgeFontSize: 9 * scale,
    sloganFontSize: 11 * scale,
    logoFontSize: 16 * scale,
    buttonPaddingV: 12 * scale,
    buttonPaddingH: 4 * scale,
    gap: 5 * scale,
    isSmall: containerWidth < 380,
  };
}

// ─── Siyah N harfi SVG ikonu ─────────────────────────
function NexTapSvgIcon({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  const color = dark ? '#0A0A0A' : '#FFFFFF';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill={dark ? '#FFFFFF' : '#0A0A0A'} />
      <path
        d="M22 78V22L50 60V22M50 60L78 22V78"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function PhoneIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function UserPlusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  );
}

// ─── Public sayfada gösterilen kart ───────────────────
export function NexTapPublicCard({ business }: { business?: LegacyBusiness }) {
  const [data, setData] = useState<NexTapContactData | null>(null);
  const s = useResponsiveSize();

  // Veri yükleme (loading state)
  useEffect(() => {
    setData(getNexTapContact());
  }, []);

  if (!data) {
    return (
      <div
        style={{
          margin: `${s.cardPadding}px`,
          borderRadius: s.cardRadius,
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: `${s.headerPadding * 2}px`,
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="status"
        aria-label="Yükleniyor"
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid rgba(251,191,36,0.2)',
            borderTopColor: '#fbbf24',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const d = data;

  const waUrl = `https://wa.me/${d.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Merhaba, NexTap dijital NFC kart hakkında bilgi almak istiyorum.')}`;
  const igUrl = d.instagram.startsWith('http') ? d.instagram : `https://instagram.com/${d.instagram.replace('@', '')}`;
  const telUrl = `tel:${d.phone.replace(/\s/g, '').replace(/^\+/, '')}`;

  const handleSaveToContacts = () => {
    if (business) {
      downloadVCard(business);
    } else {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${d.ownerName}`,
        `TEL;TYPE=CELL:${d.phone}`,
        `URL;TYPE=WhatsApp:https://wa.me/${d.whatsapp.replace(/\D/g, '')}`,
        `URL;TYPE=Instagram:https://instagram.com/${d.instagram.replace('@', '')}`,
        `NOTE:${d.slogan}`,
        'END:VCARD'
      ].join('\n');
      const blob = new Blob([vcard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${d.ownerName.replace(/\s+/g, '_')}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // İkon buton verilerini tek yerde tutalım
  const buttons = [
    {
      key: 'phone',
      href: telUrl,
      onClick: undefined,
      isButton: false,
      iconBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      iconColor: '#fff',
      icon: <PhoneIcon size={s.iconSize * 0.45} />,
      title: 'ARA',
      titleColor: '#0f172a',
      sub: 'Hemen Ara',
      hoverBg: '#f8fafc',
    },
    {
      key: 'whatsapp',
      href: waUrl,
      onClick: undefined,
      isButton: false,
      target: '_blank',
      iconBg: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
      iconColor: '#fff',
      icon: <WhatsAppIcon size={s.iconSize * 0.5} />,
      title: 'WHATSAPP',
      titleColor: '#25D366',
      sub: 'Mesaj At',
      hoverBg: '#f0fdf4',
    },
    {
      key: 'instagram',
      href: igUrl,
      onClick: undefined,
      isButton: false,
      target: '_blank',
      iconBg: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)',
      iconColor: '#fff',
      icon: <InstagramIcon size={s.iconSize * 0.45} />,
      title: 'INSTAGRAM',
      titleColor: '#E1306C',
      sub: 'Takip Et',
      hoverBg: '#fdf2f8',
    },
    {
      key: 'contact',
      href: undefined,
      onClick: handleSaveToContacts,
      isButton: true,
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      iconColor: '#fff',
      icon: <UserPlusIcon size={s.iconSize * 0.45} />,
      title: 'REHBER',
      titleColor: '#d97706',
      sub: 'Ekle',
      hoverBg: '#fffbeb',
    },
  ];

  return (
    <div
      style={{
        margin: `${s.cardPadding}px`,
        borderRadius: s.cardRadius,
        overflow: 'hidden',
        border: '1px solid #1e293b',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        width: 'auto',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
      role="region"
      aria-label="NexTap İletişim Bilgileri"
    >
      {/* Üst koyu gradient alan */}
      <div style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: `${s.headerPadding}px ${s.headerPadding}px ${s.headerPadding * 0.85}px`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dekoratif arka plan detayı */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }} />

        {/* Logo satırı - sadece yazı, ortalanmış */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: s.headerPadding * 0.85,
          position: 'relative',
        }}>
          <div style={{
            color: '#fbbf24',
            fontWeight: 900,
            fontSize: s.logoFontSize,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, -apple-system, sans-serif',
            textShadow: '0 2px 8px rgba(251,191,36,0.3)',
          }}>
            NexTap
          </div>
        </div>

        {/* Ad ve unvan kartı */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: s.headerRadius,
          padding: '10px 12px',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 10,
        }}>
          <div style={{
            width: s.avatarSize,
            height: s.avatarSize,
            borderRadius: s.avatarSize * 0.27,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: s.avatarSize * 0.42,
            boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
          }}>
            👤
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: s.nameFontSize,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{d.ownerName}</div>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: s.titleFontSize,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{d.ownerTitle}</div>
          </div>
          <div style={{
            background: 'rgba(245,158,11,0.15)',
            borderRadius: 6,
            padding: '3px 6px',
            border: '1px solid rgba(245,158,11,0.2)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: s.badgeFontSize, color: '#fbbf24', fontWeight: 700, letterSpacing: '0.03em' }}>KURUCU</span>
          </div>
        </div>

        {/* Slogan */}
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: s.sloganFontSize,
          lineHeight: 1.5,
          margin: 0,
        }}>
          "{d.slogan}"
        </p>
      </div>

      {/* 4 ikon butonu - tek sıra, ortalı, orta boy */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: '#fff',
          borderTop: '1px solid #f1f5f9',
          gap: 0,
        }}
        role="group"
        aria-label="Hızlı iletişim butonları"
      >
        {buttons.map((btn, idx) => {
          const isLast = idx === buttons.length - 1;
          const commonStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${s.buttonPaddingV}px ${s.buttonPaddingH}px`,
            textDecoration: 'none',
            borderRight: isLast ? 'none' : '1px solid #f1f5f9',
            gap: s.gap,
            transition: 'all 0.15s ease',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none' as const,
          };

          const content = (
            <>
              <div style={{
                width: s.iconSize,
                height: s.iconSize,
                borderRadius: s.iconRadius,
                background: btn.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: btn.iconColor,
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                transition: 'transform 0.15s ease',
              }}>
                {btn.icon}
              </div>
              <div style={{ textAlign: 'center', minWidth: 0, maxWidth: '100%' }}>
                <div style={{
                  fontSize: s.iconTextSize,
                  fontWeight: 800,
                  color: btn.titleColor,
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                }}>{btn.title}</div>
                <div style={{
                  fontSize: s.iconSubTextSize,
                  color: '#94a3b8',
                  marginTop: 1,
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                }}>{btn.sub}</div>
              </div>
            </>
          );

          if (btn.isButton) {
            return (
              <button
                key={btn.key}
                type="button"
                onClick={btn.onClick}
                style={commonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = btn.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = btn.hoverBg;
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                aria-label={`${btn.title} - ${btn.sub}`}
              >
                {content}
              </button>
            );
          }
          return (
            <a
              key={btn.key}
              href={btn.href}
              target={btn.target}
              rel="noreferrer"
              style={commonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = btn.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onTouchStart={(e) => {
                e.currentTarget.style.background = btn.hoverBg;
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              aria-label={`${btn.title} - ${btn.sub}`}
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin paneli düzenleme formu ─────────────────────
export function NexTapContactEditor() {
  const [data, setData] = useState<NexTapContactData>(getNexTapContact);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveNexTapContact(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <NexTapSvgIcon size={24} dark={false} />
        </div>
        <div>
          <h3 style={{ fontSize: 14, margin: 0, letterSpacing: '-0.01em' }}>NexTap İletişim Kartı</h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Her işletme sayfasının altında görünür — bir kez düzenle, her yerde güncellenir</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Ad Soyad</label>
          <input value={data.ownerName} onChange={e => setData(d => ({ ...d, ownerName: e.target.value }))} placeholder="Devran Mete" />
        </div>
        <div>
          <label>Unvan</label>
          <input value={data.ownerTitle} onChange={e => setData(d => ({ ...d, ownerTitle: e.target.value }))} placeholder="NexTap Kurucu" />
        </div>
        <div>
          <label>📞 Telefon</label>
          <input value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))} placeholder="05528134370" />
        </div>
        <div>
          <label>💬 WhatsApp (ülke kodu ile)</label>
          <input value={data.whatsapp} onChange={e => setData(d => ({ ...d, whatsapp: e.target.value }))} placeholder="905528134370" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label>📷 Instagram kullanıcı adı</label>
          <input value={data.instagram} onChange={e => setData(d => ({ ...d, instagram: e.target.value }))} placeholder="nextap veya https://instagram.com/nextap" />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>💬 Slogan</label>
        <textarea rows={2} value={data.slogan} onChange={e => setData(d => ({ ...d, slogan: e.target.value }))}
          style={{ resize: 'vertical' }} placeholder="Kısa ve çarpıcı bir cümle yazın..." />
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={handleSave}>
          {saved ? '✓ Kaydedildi' : 'Kaydet'}
        </button>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Değişiklikler tüm işletme sayfalarına anında yansır
        </span>
      </div>
    </div>
  );
}
