import { useEffect, useState } from 'react';
import { listNfcCards, assignNfcCard, unassignNfcCard, type NfcCardListItem } from '../../services/nfcService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner } from '../ui/Primitives';

const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;

export default function NfcLinkPanel({ businessId }: { businessId: string }) {
  const [cards, setCards] = useState<NfcCardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const all = await listNfcCards();
      setCards(all);
      const linked = all.find((c) => c.business_id === businessId);
      setSelected(linked?.id ?? '');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const linkedCard = cards.find((c) => c.business_id === businessId);
  const availableCards = cards.filter((c) => !c.business_id || c.business_id === businessId);

  async function handleChange(cardId: string) {
    setBusy(true);
    try {
      if (linkedCard && linkedCard.id !== cardId) {
        await unassignNfcCard(linkedCard.id);
      }
      if (cardId) {
        await assignNfcCard(cardId, businessId);
      }
      setSelected(cardId);
      showToast(cardId ? 'NFC kart bağlandı.' : 'NFC kart bağlantısı kaldırıldı.');
      load();
    } catch (err) {
      showToast(friendlyError(err, 'Kart bağlanamadı.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card" style={{ padding: 18 }}><Spinner dark /></div>;

  return (
    <div className="card" style={{ padding: 18 }}>
      <h3 style={{ fontSize: 15, marginBottom: 14 }}>📶 NFC Kart Bağlantısı</h3>
      <div style={{ background: '#111827', color: '#fff', borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Mevcut Bağlı Kart
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: '#FCD34D' }}>
          {linkedCard?.card_code ?? 'YOK'}
        </div>
        {linkedCard && (
          <div style={{ fontSize: 11, color: '#D1D5DB', marginTop: 4, fontFamily: 'monospace' }}>
            Hedef URL: <span style={{ color: '#FBBF24' }}>{PUBLIC_BASE_URL}/k/{linkedCard.card_code}</span>
          </div>
        )}
      </div>
      <label>NFC Kart Seç veya Değiştir</label>
      <select value={selected} disabled={busy} onChange={(e) => handleChange(e.target.value)}>
        <option value="">-- Kart Bağlantısını Kaldır (Boşta Bırak) --</option>
        {availableCards.map((c) => (
          <option key={c.id} value={c.id}>{c.card_code} {c.business_id === businessId ? '(bu işletmeye bağlı)' : '(boşta)'}</option>
        ))}
      </select>
    </div>
  );
}
