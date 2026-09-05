import { NexTapIcon } from '../../components/ui/NexTapLogo';

type ErrorType = 'not_found' | 'unassigned' | 'disabled';

const CONFIGS: Record<ErrorType, {
  emoji: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  hint: string;
}> = {
  not_found: {
    emoji: '🔍',
    title: 'Kart Bulunamadı',
    subtitle: 'Bu NFC kart kayıt sistemimizde mevcut değil.',
    badgeText: 'GEÇERSİZ KART',
    badgeColor: '#EF4444',
    hint: 'Kartın üzerindeki kodu kontrol edip tekrar deneyin.',
  },
  unassigned: {
    emoji: '🃏',
    title: 'Kart Henüz Aktif Değil',
    subtitle: 'Bu kart henüz bir işletmeye tanımlanmamış.',
    badgeText: 'TANIMLANMAMIŞ',
    badgeColor: '#F59E0B',
    hint: 'İşletme sahibi yakında bu kartı aktif edecek.',
  },
  disabled: {
    emoji: '🔒',
    title: 'Kart Geçici Olarak Devre Dışı',
    subtitle: 'Bu NFC kart şu an aktif değil.',
    badgeText: 'DEVRE DIŞI',
    badgeColor: '#6B7280',
    hint: 'İşletme sahibi bu kartı geçici olarak durdurmuş olabilir.',
  },
};

export default function NfcErrorPage({ type }: { type: ErrorType }) {
  const cfg = CONFIGS[type];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F8F8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Kart görseli */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {/* Arka gölge kartlar */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          width: 200, height: 124, borderRadius: 16,
          background: '#E0E0E0', transform: 'rotate(6deg)',
        }} />
        <div style={{
          position: 'absolute', top: 6, left: 6,
          width: 200, height: 124, borderRadius: 16,
          background: '#CACACA', transform: 'rotate(3deg)',
        }} />

        {/* Asıl kart */}
        <div style={{
          position: 'relative',
          width: 200, height: 124, borderRadius: 16,
          background: '#0A0A0A',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}>
          {/* NFC dalgaları dekoratif */}
          <svg style={{ position: 'absolute', top: 8, right: 8 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M6 20 A10 10 0 0 1 16 10" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M3 20 A16 16 0 0 1 19 4" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round"/>
          </svg>

          <NexTapIcon size={36} inverted={false} />
          <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginTop: 8, opacity: 0.7 }}>
            NexTap
          </div>

          {/* Pasif bant */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: cfg.badgeColor, padding: '4px 0',
            textAlign: 'center', fontSize: 9, fontWeight: 800,
            color: '#fff', letterSpacing: '0.12em',
          }}>
            {cfg.badgeText}
          </div>
        </div>

        {/* Büyük emoji */}
        <div style={{
          position: 'absolute', top: -16, right: -16,
          width: 44, height: 44, borderRadius: '50%',
          background: '#fff', border: '2px solid #E8E8E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {cfg.emoji}
        </div>
      </div>

      {/* Metin */}
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 8, textAlign: 'center', letterSpacing: '-0.03em' }}>
        {cfg.title}
      </h1>
      <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 280, lineHeight: 1.65, marginBottom: 6 }}>
        {cfg.subtitle}
      </p>
      <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', maxWidth: 260, lineHeight: 1.6, marginBottom: 32 }}>
        {cfg.hint}
      </p>

      {/* NexTap tanıtım */}
      <div style={{
        background: '#fff',
        border: '1px solid #E8E8E8',
        borderRadius: 16,
        padding: '18px 22px',
        maxWidth: 300,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <NexTapIcon size={24} inverted={false} />
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>NexTap</span>
        </div>
        <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>
          Dijital NFC işletme kartı için<br />bizimle iletişime geçin.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <a
            href="tel:+905528134370"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 12px', borderRadius: 10,
              background: '#0A0A0A', color: '#fff',
              fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="#fff">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Ara
          </a>
          <a
            href="https://wa.me/905528134370?text=Merhaba%2C%20NFC%20kart%20hakkında%20bilgi%20almak%20istiyorum."
            target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 12px', borderRadius: 10,
              background: '#25D366', color: '#fff',
              fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

      {/* Alt logo */}
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.35 }}>
        <NexTapIcon size={16} inverted={false} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#0A0A0A' }}>NEXTAP</span>
      </div>
    </div>
  );
}
