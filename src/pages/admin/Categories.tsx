import { useEffect, useState } from 'react';
import { listCategories, createCategory } from '../../services/categoryService';
import type { Category } from '../../types/database';
import { friendlyError, useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Primitives';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      setCategories(await listCategories());
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createCategory(name.trim(), icon.trim() || undefined);
      setName(''); setIcon('');
      showToast('Kategori eklendi.');
      load();
    } catch (err) {
      showToast(friendlyError(err, 'Kategori eklenemedi.'), 'error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Kategoriler</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>İşletme kategorilerini yönetin.</p>

      <div className="card" style={{ padding: 18, marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input style={{ maxWidth: 80 }} placeholder="🏷️" value={icon} onChange={(e) => setIcon(e.target.value)} />
        <input placeholder="Kategori adı" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-primary" disabled={!name.trim() || adding} onClick={handleAdd}>{adding ? <Spinner /> : '+ Ekle'}</button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><Spinner dark /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {categories.map((c) => (
            <div key={c.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
