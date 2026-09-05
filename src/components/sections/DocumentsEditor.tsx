import { useState } from 'react';
import type { DocumentFile } from '../../types/database';
import { documentService } from '../../services/listSectionService';
import { uploadBusinessAsset } from '../../services/businessService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';

const DOC_TYPES: Array<{ value: DocumentFile['doc_type']; label: string }> = [
  { value: 'menu', label: 'Menü' },
  { value: 'catalog', label: 'Katalog' },
  { value: 'price_list', label: 'Fiyat Listesi' },
  { value: 'file', label: 'Diğer' },
];

export default function DocumentsEditor({ businessId, items, onChange }: { businessId: string; items: DocumentFile[]; onChange: (i: DocumentFile[]) => void }) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentFile['doc_type']>('menu');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleUpload(file: File) {
    if (!title.trim()) {
      showToast('Önce dosya için bir başlık girin.', 'error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('Dosya boyutu 20MB\'ı geçemez.', 'error');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadBusinessAsset(businessId, file, 'document');
      const fileSize = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
      const created = await documentService.create({ business_id: businessId, title: title.trim(), file_url: url, file_size: fileSize, doc_type: docType, is_active: true, sort_order: items.length });
      onChange([...items, created]);
      setTitle('');
      showToast('Dosya yüklendi.');
    } catch (err) {
      showToast(friendlyError(err, 'Dosya yüklenemedi.'), 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      const updated = await documentService.update(id, { is_active: active });
      onChange(items.map((i) => (i.id === id ? updated : i)));
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function handleRemove(id: string) {
    try {
      await documentService.remove(id);
      onChange(items.filter((i) => i.id !== id));
      showToast('Dosya silindi.');
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((d) => (
        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--color-border)', borderRadius: 10, padding: 10 }}>
          <span>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{d.title}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{DOC_TYPES.find((t) => t.value === d.doc_type)?.label}{d.file_size ? ` · ${d.file_size}` : ''}</div>
          </div>
          <Switch on={d.is_active} onChange={(v) => handleToggle(d.id, v)} />
          <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(d.id)}>🗑️</button>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px auto', gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dosya başlığı (örn. Menü 2026)" />
        <select value={docType} onChange={(e) => setDocType(e.target.value as any)}>
          {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          {uploading ? <Spinner dark /> : 'Yükle'}
          <input type="file" accept=".pdf,image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}
