import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { listNfcCards, createNfcCard, assignNfcCard, unassignNfcCard, setNfcStatus, type NfcCardListItem } from '../../services/nfcService';
import { listMyBusinesses, type BusinessListItem } from '../../services/businessService';
import { friendlyError, useToast } from '../../components/ui/Toast';
import { EmptyState, Modal, Spinner } from '../../components/ui/Primitives';

const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;

export default function NfcCards() {
  const [cards, setCards] = useState<NfcCardListItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeCard, setActiveCard] = useState<NfcCardListItem | null>(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([listNfcCards(), listMyBusinesses()]);
      setCards(c);
      setBusinesses(b);
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const card = await createNfcCard();
      showToast(`${card.card_code} oluşturuldu.`);
      load();
    } catch (err) {
      showToast(friendlyError(err, 'NFC kart oluşturulamadı.'), 'error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>NFC Kartlar</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Fiziksel NFC kartlarınızı işletmelere bağlayın.</p>
        </div>
        <button className="btn btn-primary" disabled={creating} onClick={handleCreate}>{creating ? <Spinner /> : '+ NFC Kart Ekle'}</button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Spinner dark /></div>
      ) : cards.length === 0 ? (
        <EmptyState icon="📶" title="Henüz NFC kart yok" description="İlk NFC kartınızı oluşturun." />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                {['Kart Kodu', 'İşletme', 'Durum', 'Oluşturulma', 'Atanma', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{c.card_code}</td>
                  <td style={{ padding: '12px 16px' }}>{c.business_name ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'disabled' ? 'badge-muted' : 'badge-warning'}`}>
                      {c.status === 'active' ? 'Aktif' : c.status === 'disabled' ? 'Pasif' : 'Boşta'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{new Date(c.created_at).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{c.assigned_at ? new Date(c.assigned_at).toLocaleDateString('tr-TR') : '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveCard(c)}>Yönet</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeCard && (
        <NfcCardModal
          card={activeCard}
          businesses={businesses}
          onClose={() => setActiveCard(null)}
          onChanged={() => { setActiveCard(null); load(); }}
        />
      )}
    </div>
  );
}

function NfcCardModal({ card, businesses, onClose, onChanged }: { card: NfcCardListItem; businesses: BusinessListItem[]; onClose: () => void; onChanged: () => void }) {
  const [businessId, setBusinessId] = useState(card.business_id ?? '');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();
  const url = `${PUBLIC_BASE_URL}/k/${card.card_code}`;

  async function handleAssign() {
    if (!businessId) return;
    setBusy(true);
    try {
      await assignNfcCard(card.id, businessId);
      showToast('NFC kart işletmeye bağlandı.');
      onChanged();
    } catch (err) {
      showToast(friendlyError(err, 'Kart bağlanamadı.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleUnassign() {
    setBusy(true);
    try {
      await unassignNfcCard(card.id);
      showToast('Kartın işletme bağlantısı kaldırıldı.');
      onChanged();
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleDisabled() {
    setBusy(true);
    try {
      await setNfcStatus(card.id, card.status === 'disabled' ? 'active' : 'disabled');
      showToast('Kart durumu güncellendi.');
      onChanged();
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(url);
    showToast('URL kopyalandı.');
  }

  function downloadQr() {
    const canvas = document.getElementById(`qr-${card.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${card.card_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <Modal title={card.card_code} onClose={onClose} width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <QRCodeCanvas id={`qr-${card.id}`} value={url} size={140} />
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', wordBreak: 'break-all', textAlign: 'center' }}>{url}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={copyUrl}>Kopyala</button>
          <button className="btn btn-secondary btn-sm" onClick={downloadQr}>QR İndir</button>
        </div>
      </div>

      <label>İşletmeye Bağla</label>
      <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} style={{ marginBottom: 12 }}>
        <option value="">Seçiniz</option>
        {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" disabled={!businessId || busy} onClick={handleAssign}>{busy ? <Spinner /> : 'Karta Bağla'}</button>
        {card.business_id && <button className="btn btn-secondary btn-sm" disabled={busy} onClick={handleUnassign}>Bağlantıyı Kaldır</button>}
      </div>

      <button className="btn btn-secondary btn-sm" disabled={busy || card.status === 'available'} onClick={handleToggleDisabled}>
        {card.status === 'disabled' ? 'Kartı Aktifleştir' : 'Kartı Pasifleştir'}
      </button>
    </Modal>
  );
}
