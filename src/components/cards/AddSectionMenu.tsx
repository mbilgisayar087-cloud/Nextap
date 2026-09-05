import { useState } from 'react';
import type { SectionType } from '../../types/database';
import { SECTION_LABELS } from '../../types/database';

// Sections a business may have only once — hidden from the "add" menu once present.
const SINGLETON_SECTIONS = new Set<SectionType>(['business', 'contact', 'location', 'payment', 'working_hours', 'reviews', 'appointments']);

export default function AddSectionMenu({ existingTypes, onAdd }: { existingTypes: SectionType[]; onAdd: (type: SectionType) => void }) {
  const [open, setOpen] = useState(false);
  const existing = new Set(existingTypes);

  const options = (Object.keys(SECTION_LABELS) as SectionType[]).filter((type) => {
    if (SINGLETON_SECTIONS.has(type) && existing.has(type)) return false;
    return true;
  });

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setOpen((o) => !o)}>+ Bölüm Ekle</button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div className="card" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 20, padding: 8, maxHeight: 320, overflowY: 'auto' }}>
            {options.length === 0 && <div style={{ padding: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>Tüm bölümler eklendi.</div>}
            {options.map((type) => (
              <button
                key={type}
                onClick={() => { onAdd(type); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 10px', borderRadius: 8, background: 'none', border: 'none', textAlign: 'left', fontSize: 13.5, fontWeight: 600 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <span>{SECTION_LABELS[type].icon}</span>
                <span>{SECTION_LABELS[type].label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
