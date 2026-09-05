import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../services/authService';
import { friendlyError, useToast } from '../../components/ui/Toast';
import { NexTapWordmark, NexTapVertical } from '../../components/ui/NexTapLogo';

// SVG göz ikonları — emoji yok
function EyeOpen() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      showToast(friendlyError(err, 'E-posta veya şifre hatalı.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="legacy-ui" style={{ minHeight: '100vh', display: 'flex', background: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sol panel: branding ── */}
      <div className="login-left" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '44px 52px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dekoratif arka plan — 3 yumuşak daire */}
        <div style={{ position: 'absolute', top: -140, right: -100, width: 440, height: 440, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none', animation: 'rotSlow 30s linear infinite' }} />
        <div style={{ position: 'absolute', top: -70, right: -30, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)', pointerEvents: 'none', animation: 'rotSlow 20s linear infinite reverse' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -70, width: 380, height: 380, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none', animation: 'rotSlow 25s linear infinite' }} />
        {/* İnce yatay çizgiler — arka plan doku */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ animation: 'fadeSlideIn .6s ease forwards' }}>
          <NexTapWordmark height={30} inverted={false} />
        </div>

        {/* Orta — slogan */}
        <div style={{ zIndex: 1, animation: 'fadeSlideIn .7s .1s ease both' }}>
          {/* Canlı badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 999, padding: '6px 14px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'glow 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Dijital NFC İşletme Kartı
            </span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1.18, letterSpacing: '-0.035em', marginBottom: 18 }}>
            İşletmenizi<br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>bir dokunuşla</span><br />
            tanıtın.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, maxWidth: 360 }}>
            NFC kartınızı kurun, bilgilerinizi güncelleyin, müşterileriniz anında ulaşsın.
          </p>

          {/* 3 özellik satırı */}
          {['Anında kurulum — 2 dakika yeterli', 'İstediğin an güncelle, kart değişmez', 'WhatsApp, harita, IBAN — hepsi tek kart'].map((txt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, animation: `fadeSlideIn .5s ${.2 + i * .1}s ease both` }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 12 12" width="10" height="10"><polyline points="2,6 5,9 10,3" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>{txt}</span>
            </div>
          ))}
        </div>

        {/* Alt */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1, animation: 'fadeSlideIn .6s .4s ease both' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
            NexTap · Devran Mete · 0552 813 43 70
          </span>
        </div>
      </div>

      {/* ── Sağ panel: form ── */}
      <div className="login-right" style={{
        width: 480, background: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 52px', position: 'relative',
      }}>
        {/* Üst sağ ikon */}
        <div style={{ position: 'absolute', top: 28, right: 28, opacity: 0.08 }}>
          <NexTapVertical size={44} inverted={true} />
        </div>

        <div style={{ width: '100%', maxWidth: 340, animation: 'fadeSlideIn .5s ease both' }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.035em', marginBottom: 6, color: '#0A0A0A' }}>
              Giriş Yap
            </h2>
            <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6 }}>
              NexTap yönetim panelinize erişin.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7 }}>
                E-posta adresi
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@nextap.com"
                autoFocus
                style={{
                  width: '100%', padding: '13px 15px', fontSize: 14.5,
                  border: '1.5px solid #E5E7EB', borderRadius: 12, outline: 'none',
                  background: '#FAFAFA', fontFamily: 'inherit', boxSizing: 'border-box',
                  transition: 'all .15s ease', color: '#0A0A0A',
                }}
                onFocus={e => { e.target.style.borderColor = '#0A0A0A'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.06)'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#FAFAFA'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Şifre */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7 }}>
                Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '13px 48px 13px 15px', fontSize: 14.5,
                    border: '1.5px solid #E5E7EB', borderRadius: 12, outline: 'none',
                    background: '#FAFAFA', fontFamily: 'inherit', boxSizing: 'border-box',
                    transition: 'all .15s ease', color: '#0A0A0A',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0A0A0A'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#FAFAFA'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 6, transition: 'background .12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {showPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Buton */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px 24px', fontSize: 15, fontWeight: 700,
              background: '#0A0A0A', color: '#fff',
              border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .15s ease', letterSpacing: '-0.01em',
              opacity: loading ? 0.7 : 1,
            }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.background = '#222'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0A0A0A'; (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 10h12M11 5l5 5-5 5"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#D1D5DB' }}>
              NexTap © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes rotSlow { to { transform: rotate(360deg); } }
        @keyframes glow { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,0.4)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(74,222,128,0)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; padding: 36px 24px !important; }
        }
      `}</style>
    </div>
  );
}
