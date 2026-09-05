import { type ReactNode, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Switch } from '../ui/Primitives';

export default function SectionCardShell({
  id, icon, title, subtitle, isActive, onToggleActive, onRemove, removable, children,
}: {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  isActive: boolean;
  onToggleActive: (v: boolean) => void;
  onRemove?: () => void;
  removable?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="card" data-active={isActive}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: expanded ? '1px solid var(--color-border)' : 'none' }}>
        <span {...attributes} {...listeners} style={{ cursor: 'grab', color: '#9CA3AF', fontSize: 16, touchAction: 'none' }} title="Sürükle">⋮⋮</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded((e) => !e)}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>}
        </div>
        <Switch on={isActive} onChange={onToggleActive} />
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded((e) => !e)}>{expanded ? 'Kapat' : 'Düzenle'}</button>
        {removable && onRemove && (
          <button className="btn btn-ghost btn-sm" title="Bölümü kaldır" onClick={onRemove}>🗑️</button>
        )}
      </div>
      {expanded && <div style={{ padding: 16 }}>{children}</div>}
    </div>
  );
}
