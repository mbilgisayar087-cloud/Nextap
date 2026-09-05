import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBusiness, listMyBusinesses, softDeleteBusiness, type BusinessListItem } from '../../services/businessService';
import { listCategories } from '../../services/categoryService';
import type { Category } from '../../types/database';
import { EmptyState, Spinner } from '../../components/ui/Primitives';
import { Modal } from '../../components/ui/Primitives';
import { friendlyError, useToast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';

export default function Businesses() {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([listMyBusinesses(), listCategories()]);
      setBusinesses(b);
      setCategories(c);
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (search && !b.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR'))) return false;
      if (categoryFilter !== 'all' && b.category_id !== categoryFilter) return false;
      if (statusFilter === 'active' && !b.is_active) return false;
      if (statusFilter === 'inactive' && b.is_active) return false;
      return true;
    });
  }, [businesses, search, categoryFilter, statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm('Bu işletmeyi silmek istediğinize emin misiniz?')) return;
    try {
      await softDeleteBusiness(id);
      showToast('İşletme silindi.');
      load();
    } catch (err) {
      showToast(friendlyError(err, 'İşletme silinemedi.'), 'error');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>İşletmeler</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Tüm işletmelerinizi buradan yönetin.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Yeni İşletme</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={{ maxWidth: 260 }} placeholder="İşletme ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={{ maxWidth: 200 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Tüm Kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select style={{ maxWidth: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Spinner dark /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏢" title="İşletme bulunamadı" description="Yeni bir işletme oluşturarak başlayın." action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Yeni İşletme</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {filtered.map((b) => (
            <BusinessCard key={b.id} business={b} onDelete={() => handleDelete(b.id)} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBusinessModal
          categories={categories}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function BusinessCard({ business, onDelete }: { business: BusinessListItem; onDelete: () => void }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {business.logo_url ? <img src={business.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18 }}>🏢</span>}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business.name}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{business.category_name ?? 'Kategorisiz'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span className={`badge ${business.is_active ? 'badge-success' : 'badge-muted'}`}>{business.is_active ? 'Aktif' : 'Pasif'}</span>
        <span className="badge badge-muted">{business.nfc_card_code ?? 'NFC bağlı değil'}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
        Son güncelleme: {new Date(business.updated_at).toLocaleDateString('tr-TR')}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Link to={`/admin/businesses/${business.id}`} className="btn btn-secondary btn-sm">Düzenle</Link>
        {business.slug && <a href={`/k/preview/${business.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Önizle</a>}
        <Link to="/admin/nfc-cards" className="btn btn-secondary btn-sm">NFC</Link>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>Sil</button>
      </div>
    </div>
  );
}

function CreateBusinessModal({ categories, onClose, onCreated }: { categories: Category[]; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const { session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!name.trim() || !session) return;
    setSaving(true);
    try {
      const business = await createBusiness({ name: name.trim(), category_id: categoryId || null, is_active: isActive, owner_id: session.user.id });
      showToast('İşletme oluşturuldu.');
      onCreated();
      navigate(`/admin/businesses/${business.id}`);
    } catch (err) {
      showToast(friendlyError(err, 'İşletme oluşturulamadı.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Yeni İşletme" onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <label>İşletme Adı</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. ABC Kebap" autoFocus />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>Kategori</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Seçiniz</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <label style={{ margin: 0 }}>Aktif</label>
        <input type="checkbox" style={{ width: 'auto' }} checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>İptal</button>
        <button className="btn btn-primary" disabled={!name.trim() || saving} onClick={handleSubmit}>
          {saving ? <Spinner /> : 'Oluştur ve Düzenle'}
        </button>
      </div>
    </Modal>
  );
}
