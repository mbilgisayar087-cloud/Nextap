import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

import { getBusinessFull, updateBusiness } from '../../services/businessService';
import { addSection, removeSection, saveSectionOrder, toggleSectionActive } from '../../services/sectionService';
import type { BusinessFull, SectionType } from '../../types/database';
import { SECTION_LABELS } from '../../types/database';
import { friendlyError, useToast } from '../../components/ui/Toast';
import { Spinner, Switch } from '../../components/ui/Primitives';

import SectionCardShell from '../../components/cards/SectionCardShell';
import AddSectionMenu from '../../components/cards/AddSectionMenu';
import BusinessInfoEditor from '../../components/sections/BusinessInfoEditor';
import ContactEditor from '../../components/sections/ContactEditor';
import SocialEditor from '../../components/sections/SocialEditor';
import { LocationEditor, PaymentEditor, AppointmentEditor, ReviewsEditor } from '../../components/sections/SmallSingletonEditors';
import WorkingHoursEditor from '../../components/sections/WorkingHoursEditor';
import ServicesEditor from '../../components/sections/ServicesEditor';
import CampaignsEditor from '../../components/sections/CampaignsEditor';
import GalleryEditor from '../../components/sections/GalleryEditor';
import AnnouncementsEditor from '../../components/sections/AnnouncementsEditor';
import DocumentsEditor from '../../components/sections/DocumentsEditor';
import AppearanceEditor from '../../components/sections/AppearanceEditor';
import NfcLinkPanel from '../../components/sections/NfcLinkPanel';
import BusinessPublicView from '../../components/public/BusinessPublicView';
import DeviceFrame from '../../components/public/DeviceFrame';

export default function BusinessEditor() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BusinessFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const { showToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const full = await getBusinessFull(id);
      if (!full) showToast('İşletme bulunamadı.', 'error');
      setData(full);
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><Spinner dark /></div>;
  if (!data) return <p>İşletme bulunamadı.</p>;

  const orderedSections = [...data.sections].sort((a, b) => a.sort_order - b.sort_order);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !data) return;
    const oldIndex = orderedSections.findIndex((s) => s.id === active.id);
    const newIndex = orderedSections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(orderedSections, oldIndex, newIndex);
    setData({ ...data, sections: reordered });
    try {
      await saveSectionOrder(reordered);
    } catch (err) {
      showToast(friendlyError(err, 'Sıralama kaydedilemedi.'), 'error');
      load();
    }
  }

  async function handleToggleActive(sectionId: string, active: boolean) {
    if (!data) return;
    setData({ ...data, sections: data.sections.map((s) => (s.id === sectionId ? { ...s, is_active: active } : s)) });
    try {
      await toggleSectionActive(sectionId, active);
    } catch (err) {
      showToast(friendlyError(err), 'error');
    }
  }

  async function handleAddSection(type: SectionType) {
    if (!data) return;
    try {
      const nextOrder = data.sections.length;
      const created = await addSection(data.business.id, type, nextOrder);
      setData({ ...data, sections: [...data.sections, created] });
      showToast(`${SECTION_LABELS[type].label} bölümü eklendi.`);
    } catch (err) {
      showToast(friendlyError(err, 'Bölüm eklenemedi.'), 'error');
    }
  }

  async function handleRemoveSection(sectionId: string) {
    if (!data) return;
    if (!confirm('Bu bölümü kaldırmak istediğinize emin misiniz?')) return;
    try {
      await removeSection(sectionId);
      setData({ ...data, sections: data.sections.filter((s) => s.id !== sectionId) });
      showToast('Bölüm kaldırıldı.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    }
  }

  async function handleToggleBusinessActive(active: boolean) {
    if (!data) return;
    try {
      const updated = await updateBusiness(data.business.id, { is_active: active });
      setData({ ...data, business: updated });
      showToast(active ? 'İşletme aktifleştirildi.' : 'İşletme pasifleştirildi.');
    } catch (err) {
      showToast(friendlyError(err), 'error');
    }
  }

  function renderEditor(type: SectionType) {
    if (!data) return null;
    switch (type) {
      case 'business':
        return <BusinessInfoEditor business={data.business} onSaved={(b) => setData({ ...data, business: b })} />;
      case 'contact':
        return <ContactEditor businessId={data.business.id} contact={data.contact} onSaved={(c) => setData({ ...data, contact: c })} />;
      case 'social':
        return <SocialEditor businessId={data.business.id} links={data.social} onChange={(l) => setData({ ...data, social: l })} />;
      case 'location':
        return <LocationEditor businessId={data.business.id} location={data.location} onSaved={(l) => setData({ ...data, location: l })} />;
      case 'payment':
        return <PaymentEditor businessId={data.business.id} payment={data.payment} onSaved={(p) => setData({ ...data, payment: p })} />;
      case 'working_hours':
        return <WorkingHoursEditor businessId={data.business.id} hours={data.workingHours} onSaved={(h) => setData({ ...data, workingHours: h })} />;
      case 'services':
        return <ServicesEditor businessId={data.business.id} items={data.services} onChange={(s) => setData({ ...data, services: s })} />;
      case 'campaigns':
        return <CampaignsEditor businessId={data.business.id} items={data.campaigns} onChange={(c) => setData({ ...data, campaigns: c })} />;
      case 'gallery':
        return <GalleryEditor businessId={data.business.id} images={data.gallery} onChange={(g) => setData({ ...data, gallery: g })} />;
      case 'appointments':
        return <AppointmentEditor businessId={data.business.id} appointment={data.appointment} onSaved={(a) => setData({ ...data, appointment: a })} />;
      case 'reviews':
        return <ReviewsEditor businessId={data.business.id} reviews={data.reviews} onSaved={(r) => setData({ ...data, reviews: r })} />;
      case 'announcements':
        return <AnnouncementsEditor businessId={data.business.id} items={data.announcements} onChange={(a) => setData({ ...data, announcements: a })} />;
      case 'documents':
        return <DocumentsEditor businessId={data.business.id} items={data.documents} onChange={(d) => setData({ ...data, documents: d })} />;
      default:
        return null;
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <Link to="/admin/businesses" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>← İşletmeler</Link>
          <h1 style={{ fontSize: 22, marginTop: 4 }}>{data.business.name}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-secondary preview-toggle-mobile" onClick={() => setShowPreviewMobile((v) => !v)}>
            {showPreviewMobile ? 'Editörü Göster' : '📱 Önizleme'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>İşletme {data.business.is_active ? 'Aktif' : 'Pasif'}</span>
            <Switch on={data.business.is_active} onChange={handleToggleBusinessActive} />
          </div>
        </div>
      </div>

      <div className="editor-grid">
        <div className={`editor-col ${showPreviewMobile ? 'hide-mobile' : ''}`} style={{ display: 'grid', gap: 14 }}>
          <AppearanceEditor business={data.business} onSaved={(b) => setData({ ...data, business: b })} />
          <NfcLinkPanel businessId={data.business.id} />

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'grid', gap: 12 }}>
                {orderedSections.map((section) => (
                  <SectionCardShell
                    key={section.id}
                    id={section.id}
                    icon={SECTION_LABELS[section.section_type].icon}
                    title={SECTION_LABELS[section.section_type].label}
                    isActive={section.is_active}
                    onToggleActive={(v) => handleToggleActive(section.id, v)}
                    removable={section.section_type !== 'business'}
                    onRemove={() => handleRemoveSection(section.id)}
                  >
                    {renderEditor(section.section_type)}
                  </SectionCardShell>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <AddSectionMenu existingTypes={orderedSections.map((s) => s.section_type)} onAdd={handleAddSection} />
        </div>

        <div className={`preview-col ${showPreviewMobile ? '' : 'hide-mobile-preview'}`}>
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10, textAlign: 'center' }}>📱 Canlı Önizleme</div>
            <div className="device-frame-wrap">
              <DeviceFrame width={390} height={780}>
                <BusinessPublicView data={data} />
              </DeviceFrame>
            </div>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <a href={`/k/preview/${data.business.id}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Tam Ekran Aç ↗</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .editor-grid { display: grid; grid-template-columns: 1fr 410px; gap: 24px; align-items: start; }
        .device-frame-wrap { transform-origin: top center; }
        .hide-mobile, .hide-mobile-preview { display: grid; }
        .preview-toggle-mobile { display: none; }
        @media (max-width: 980px) {
          .editor-grid { grid-template-columns: 1fr; }
          .preview-toggle-mobile { display: inline-flex; }
          .hide-mobile { display: none; }
          .preview-col.hide-mobile-preview { display: none; }
          .device-frame-wrap { transform: scale(0.92); }
        }
      `}</style>
    </div>
  );
}
