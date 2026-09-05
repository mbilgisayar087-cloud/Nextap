/**
 * NexTap inline SVG logo sistemi.
 * NFC dalgası (◌ sembolü) + kalın N harfi kombinasyonu.
 * Dışarıdan dosya/font bağımlılığı yok — her ortamda render edilir.
 */

interface IconProps { size?: number; inverted?: boolean; }

// ── İkon: NFC dalgası içine yerleştirilmiş N ─────────
export function NexTapIcon({ size = 32, inverted = false }: IconProps) {
  const bg   = inverted ? '#fff' : '#0A0A0A';
  const fg   = inverted ? '#0A0A0A' : '#fff';
  const arc  = inverted ? '#0A0A0A' : 'rgba(255,255,255,0.30)';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Kare arka plan */}
      <rect width="100" height="100" rx="24" fill={bg} />

      {/* NFC dalgaları — soldan */}
      <path d="M14 50 A20 20 0 0 1 34 30" stroke={arc} strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M10 50 A30 30 0 0 1 40 20" stroke={arc} strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* NFC dalgaları — sağdan */}
      <path d="M86 50 A20 20 0 0 0 66 30" stroke={arc} strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M90 50 A30 30 0 0 0 60 20" stroke={arc} strokeWidth="4" strokeLinecap="round" fill="none"/>

      {/* N harfi — merkezde, kalın ve net */}
      <path
        d="M30 72 L30 28 L52 62 L52 28 M52 62 L74 28 L74 72"
        stroke={fg}
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ── Yatay wordmark: İkon + NexTap yazısı ─────────────
export function NexTapWordmark({ height = 28, inverted = false }: { height?: number; inverted?: boolean }) {
  const iconSize = Math.round(height * 1.25);
  const textColor = inverted ? '#0A0A0A' : '#fff';
  const textY = height * 0.82;
  const fs    = height * 0.85;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(height * 0.35), userSelect: 'none' }}>
      <NexTapIcon size={iconSize} inverted={inverted} />
      <svg
        viewBox={`0 0 ${Math.round(fs * 3.5)} ${height}`}
        height={height}
        style={{ overflow: 'visible', flexShrink: 0 }}
      >
        <text
          x="0" y={textY}
          fontFamily="Inter, -apple-system, sans-serif"
          fontSize={fs}
          fill={textColor}
        >
          <tspan fontWeight="300" letterSpacing="-0.5">Nex</tspan><tspan fontWeight="900" letterSpacing="-1">Tap</tspan>
        </text>
      </svg>
    </div>
  );
}

// ── Dikey logo: İkon üstte, NexTap altında ───────────
export function NexTapVertical({ size = 80, inverted = false }: { size?: number; inverted?: boolean }) {
  const textColor = inverted ? '#0A0A0A' : '#fff';
  const fs = Math.round(size * 0.22);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(size * 0.1), userSelect: 'none' }}>
      <NexTapIcon size={size} inverted={inverted} />
      <svg viewBox="0 0 100 24" height={fs} style={{ overflow: 'visible' }}>
        <text x="50" y="19" textAnchor="middle"
          fontFamily="Inter, -apple-system, sans-serif"
          fontSize="22"
          fill={textColor}
        >
          <tspan fontWeight="300">Nex</tspan><tspan fontWeight="900">Tap</tspan>
        </text>
      </svg>
    </div>
  );
}
