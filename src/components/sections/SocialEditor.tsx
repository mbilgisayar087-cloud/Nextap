import { useState } from 'react';
import type { SocialLink } from '../../types/database';
import { socialLinkService } from '../../services/listSectionService';
import { friendlyError, useToast } from '../ui/Toast';
import { Spinner, Switch } from '../ui/Primitives';
import { SOCIAL_PLATFORMS, getPlatformDef, PlatformIcon } from '../../lib/socialPlatforms';

export default function SocialEditor({
  businessId, links, onChange,
}: { businessId: string; links: SocialLink[]; onChange: (l: SocialLink[]) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  const def = getPlatformDef(selectedPlatform);

  function handlePickPlatform(value: string) {
    setSelectedPlatform(value);
    const d = getPlatformDef(value);
    setUrl(d.urlPrefix);
    setShowPicker(false);
  }

  async function handleAdd() {
    if (!url.trim()) return;
    setAdding(true);
    try {
      const created = await socialLinkService.create({
        business_id: businessId,
        platform: selectedPlatform,
        label: def.label,
        url: url.trim(),
        username: username.trim() || null,
        is_active: true,
        sort_order: links.length,
      });
      onChange([...links, created]);
      setUrl(''); setUsername('');
      showToast('Sosyal medya bağlantısı eklendi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      const updated = await socialLinkService.update(id, { is_active: active });
      onChange(links.map(l => l.id === id ? updated : l));
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  async function handleRemove(id: string) {
    try {
      await socialLinkService.remove(id);
      onChange(links.filter(l => l.id !== id));
      showToast('Bağlantı silindi.');
    } catch (err) { showToast(friendlyError(err), 'error'); }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Mevcut bağlantılar */}
      {links.map(l => {
        const d = getPlatformDef(l.platform);
        return (
          <div key={l.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px',
            opacity: l.is_active ? 1 : 0.5,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: d.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <PlatformIcon value={l.platform} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{d.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {l.username ? `@${l.username}` : l.url}
              </div>
            </div>
            <Switch on={l.is_active} onChange={v => handleToggle(l.id, v)} />
            <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(l.id)}>🗑️</button>
          </div>
        );
      })}

      {/* Yeni ekle */}
      <div style={{ border: '1px dashed var(--color-border)', borderRadius: 12, padding: 14, background: '#FAFAFA' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          + Yeni Sosyal Medya Ekle
        </div>

        {/* Platform seçici */}
        <div style={{ marginBottom: 10 }}>
          <label>Platform Seç</label>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowPicker(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 10,
                background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: def.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <PlatformIcon value={selectedPlatform} size={14} />
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{def.label}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{showPicker ? '▲' : '▼'}</span>
            </button>

            {showPicker && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setShowPicker(false)} />
                <div style={{
                  position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 10,
                  background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', maxHeight: 320, overflowY: 'auto',
                }}>
                  {SOCIAL_PLATFORMS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handlePickPlatform(p.value)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: selectedPlatform === p.value ? '#F5F5F5' : 'none',
                        border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'background .1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
                      onMouseLeave={e => (e.currentTarget.style.background = selectedPlatform === p.value ? '#F5F5F5' : 'none')}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: p.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <PlatformIcon value={p.value} size={16} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <div>
            <label>URL / Bağlantı</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder={def.urlPrefix + 'kullanici'} />
          </div>
          <div>
            <label>Kullanıcı adı (opsiyonel, örn. @nextap)</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="@kullanici" />
          </div>
          <button className="btn btn-primary btn-sm" style={{ justifySelf: 'start' }} disabled={adding || !url.trim()} onClick={handleAdd}>
            {adding ? <Spinner /> : '+ Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
