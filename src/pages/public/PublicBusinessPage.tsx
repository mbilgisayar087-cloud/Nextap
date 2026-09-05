import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBusinessByCardCode } from '../../services/businessService';
import type { BusinessFull } from '../../types/database';
import BusinessPublicView from '../../components/public/BusinessPublicView';
import NfcErrorPage from './NfcErrorPage';
import { NexTapIcon } from '../../components/ui/NexTapLogo';

type ViewState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'unassigned' }
  | { status: 'disabled' }
  | { status: 'ok'; data: BusinessFull };

export default function PublicBusinessPage() {
  const { cardCode } = useParams<{ cardCode: string }>();
  const [state, setState] = useState<ViewState>({ status: 'loading' });

  useEffect(() => {
    if (!cardCode) return;
    getBusinessByCardCode(cardCode).then((res) => setState(res as ViewState));
  }, [cardCode]);

  if (state.status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', gap: 16 }}>
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
          <NexTapIcon size={52} inverted={false} />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          Yükleniyor...
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }
  if (state.status === 'not_found')  return <NfcErrorPage type="not_found" />;
  if (state.status === 'unassigned') return <NfcErrorPage type="unassigned" />;
  if (state.status === 'disabled')   return <NfcErrorPage type="disabled" />;
  if (state.status === 'ok')         return <BusinessPublicView data={state.data} cardCode={cardCode ?? null} />;
  return null;
}
