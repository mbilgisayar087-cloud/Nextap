import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';
import { listMyBusinesses, type BusinessListItem } from '../../services/businessService';
import { listNfcCards, type NfcCardListItem } from '../../services/nfcService';
import { Spinner } from '../../components/ui/Primitives';

const STATS: Array<{ key: keyof DashboardStats; label: string; icon: string }> = [
  { key: 'totalBusinesses',   label: 'Toplam İşletme',  icon: '◫' },
  { key: 'activeBusinesses',  label: 'Aktif İşletme',   icon: '✓' },
  { key: 'totalNfcCards',     label: 'Toplam NFC Kart', icon: '◈' },
  { key: 'availableNfcCards', label: 'Boş Kart',        icon: '○' },
  { key: 'activeNfcCards',    label: 'Aktif Kart',       icon: '●' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [cards, setCards] = useState<NfcCardListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), listMyBusinesses(), listNfcCards()])
      .then(([s, b, c]) => { setStats(s); setBusinesses(b.slice(0, 6)); setCards(c.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spinner dark /></div>;

  return (
    <div>
      {/* Başlık */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Genel Bakış</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>NexTap yönetim paneline hoş geldiniz.</p>
      </div>

      {/* İstatistik kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 32 }}>
        {STATS.map((s) => (
          <div key={s.key} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 10, color: 'var(--color-text-muted)' }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 2 }}>
              {stats?.[s.key] ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Son işlemler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Son İşletmeler</span>
            <Link to="/admin/businesses" className="btn btn-ghost btn-sm">Tümünü Gör →</Link>
          </div>
          {businesses.length === 0 && (
            <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center' }}>Henüz işletme yok.</div>
          )}
          {businesses.map((b) => (
            <Link key={b.id} to={`/admin/businesses/${b.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8F8F8')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {b.logo_url ? <img src={b.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 14 }}>◫</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{b.category_name ?? 'Kategorisiz'}</div>
                </div>
              </div>
              <span className={`badge ${b.is_active ? 'badge-success' : 'badge-muted'}`}>{b.is_active ? 'Aktif' : 'Pasif'}</span>
            </Link>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Son NFC Kartlar</span>
            <Link to="/admin/nfc-cards" className="btn btn-ghost btn-sm">Tümünü Gör →</Link>
          </div>
          {cards.length === 0 && (
            <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center' }}>Henüz kart yok.</div>
          )}
          {cards.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>{c.card_code}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.business_name ?? '—'}</div>
              </div>
              <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'disabled' ? 'badge-muted' : 'badge-warning'}`}>
                {c.status === 'active' ? 'Aktif' : c.status === 'disabled' ? 'Pasif' : 'Boşta'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
