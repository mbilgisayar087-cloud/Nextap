import { useAuth } from '../../hooks/useAuth';
import NextapContactEditor from '../../components/sections/NextapContactEditor';

export default function Settings() {
  const { session } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Ayarlar</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 32, fontSize: 14 }}>Hesap ve NexTap iletişim bilgilerini yönetin.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 20, alignItems: 'start' }}>

        {/* NexTap iletişim editörü */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>📣 NexTap İletişim Kartı</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Her işletme sayfasının altında görünen reklam kartınız.
          </p>
          <NextapContactEditor />
        </div>

        {/* Hesap bilgileri */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Hesap Bilgileri</h3>
          <div style={{ marginBottom: 16 }}>
            <label>E-posta</label>
            <p style={{ fontSize: 15, fontWeight: 600 }}>{session?.user.email}</p>
          </div>
          <div>
            <label>Kullanıcı ID</label>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace', wordBreak: 'break-all', background: 'var(--color-bg)', padding: '8px 10px', borderRadius: 8, marginTop: 4 }}>{session?.user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
