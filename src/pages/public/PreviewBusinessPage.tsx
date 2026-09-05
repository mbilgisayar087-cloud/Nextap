import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBusinessFull } from '../../services/businessService';
import type { BusinessFull } from '../../types/database';
import BusinessPublicView from '../../components/public/BusinessPublicView';
import { Spinner } from '../../components/ui/Primitives';

/** Owner-only full-screen preview — reachable even before an NFC card is linked. */
export default function PreviewBusinessPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const [data, setData] = useState<BusinessFull | null | undefined>(undefined);

  useEffect(() => {
    if (!businessId) return;
    getBusinessFull(businessId).then(setData);
  }, [businessId]);

  if (data === undefined) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner dark /></div>;
  }
  if (data === null) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>İşletme bulunamadı.</div>;
  }
  return <BusinessPublicView data={data} />;
}
