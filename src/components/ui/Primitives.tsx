import { type ReactNode, useEffect } from 'react';

export function Switch({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="switch"
      data-on={on}
      disabled={disabled}
      aria-pressed={on}
      aria-label={on ? 'Aktif' : 'Pasif'}
      onClick={() => onChange(!on)}
    />
  );
}

export function Spinner({ dark }: { dark?: boolean }) {
  return <div className={`spinner ${dark ? 'spinner-dark' : ''}`} />;
}

export function Modal({ title, onClose, children, width = 480 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: width, maxHeight: '85vh', overflowY: 'auto', padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: 18 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16, color: 'var(--color-text)', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 14, marginBottom: 18 }}>{description}</p>
      {action}
    </div>
  );
}
