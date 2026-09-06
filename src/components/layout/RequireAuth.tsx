import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/Primitives';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="legacy-ui" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner dark />
      </div>
    );
  }

  // Session yoksa veya token süresi dolmuşsa login'e yönlendir
  const isExpired = session?.expires_at ? session.expires_at * 1000 < Date.now() : true;
  if (!session || isExpired) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
