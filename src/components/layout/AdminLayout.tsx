import { useState } from 'react';
import { NexTapWordmark, NexTapIcon } from '../ui/NexTapLogo';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from '../../services/authService';
import { useToast } from '../ui/Toast';

const NAV = [
  { to: '/admin',             label: 'Ana Sayfa',   icon: '🏠', end: true },
  { to: '/admin/businesses',  label: 'İşletmeler',  icon: '🏢' },
  { to: '/admin/nfc-cards',   label: 'NFC Kartlar', icon: '📶' },
  { to: '/admin/categories',  label: 'Kategoriler', icon: '🏷️' },
  { to: '/admin/settings',    label: 'Ayarlar',     icon: '⚙️' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSignOut() {
    try { await signOut(); navigate('/admin/login'); }
    catch { showToast('Çıkış yapılamadı.', 'error'); }
  }

  const sidebarW = collapsed ? 72 : 240;

  return (
    <div className="legacy-ui" style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>

      {/* Mobil backdrop */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40, backdropFilter: 'blur(3px)' }} />
      )}

      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: sidebarW, background: '#0A0A0A',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50,
        transition: 'width .2s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
      }} className={`admin-sidebar${mobileOpen ? ' mob-open' : ''}`}>

        {/* Logo + toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '18px 0' : '18px 16px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: 64 }}>
          {!collapsed && (
            <NexTapWordmark height={22} inverted={false} />
          )}
          {collapsed && (
            <NexTapIcon size={26} inverted={false} />
          )}
          <button onClick={() => setCollapsed(v => !v)} style={{
            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13, flexShrink: 0,
            transition: 'background .12s ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            title={collapsed ? 'Genişlet' : 'Daralt'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowX: 'hidden' }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '11px 0' : '11px 12px',
                borderRadius: 10, fontSize: 14, fontWeight: 600,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.42)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none', transition: 'all .12s ease',
                whiteSpace: 'nowrap', overflow: 'hidden',
              })}
              onMouseEnter={e => { if (!(e.currentTarget as HTMLElement).style.background.includes('0.1')) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!(e.currentTarget as HTMLElement).style.background.includes('0.1')) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={handleSignOut} title={collapsed ? 'Çıkış' : undefined} style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%', padding: collapsed ? '11px 0' : '11px 12px',
            borderRadius: 10, background: 'none', border: 'none',
            fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
          >
            <span style={{ fontSize: 17, flexShrink: 0 }}>🚪</span>
            {!collapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main area ───────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, marginLeft: sidebarW, transition: 'margin-left .2s cubic-bezier(.4,0,.2,1)' }} className="admin-main">

        {/* Mobil topbar */}
        <header className="mobile-topbar">
          <button onClick={() => setMobileOpen(v => !v)} style={{
            display: 'flex', flexDirection: 'column', gap: 5,
            padding: 8, background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <span style={{ display: 'block', width: 22, height: 2, background: '#0A0A0A', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 15, height: 2, background: '#0A0A0A', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#0A0A0A', borderRadius: 2 }} />
          </button>
          <NexTapWordmark height={20} inverted={true} />
          <span style={{ width: 38 }} />
        </header>

        <main style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        .mobile-topbar { display: none; }
        @media (max-width: 860px) {
          .admin-sidebar { transform: translateX(-280px) !important; box-shadow: none; width: 240px !important; }
          .admin-sidebar.mob-open { transform: translateX(0) !important; box-shadow: 6px 0 32px rgba(0,0,0,0.4) !important; }
          .admin-main { margin-left: 0 !important; }
          .mobile-topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 18px; background: #fff; border-bottom: 1px solid #EBEBEB;
            position: sticky; top: 0; z-index: 30;
          }
          main { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
