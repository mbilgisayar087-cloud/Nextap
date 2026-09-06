import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Spinner } from '../components/ui/Primitives';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  signOut: async () => {},
});

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 dakika

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearAllTimers() {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }

  function scheduleExpiry(s: Session | null) {
    if (!s?.expires_at) return;
    const expiresAtMs = s.expires_at * 1000;
    const diffMs = expiresAtMs - Date.now();
    if (diffMs <= 0) {
      // Token zaten süresi dolmuş
      supabase.auth.signOut();
      setSession(null);
      return;
    }
    expiryTimerRef.current = setTimeout(() => {
      supabase.auth.signOut();
      setSession(null);
    }, diffMs);
  }

  function resetIdleTimer() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      supabase.auth.signOut();
      setSession(null);
    }, INACTIVITY_TIMEOUT_MS);
  }

  useEffect(() => {
    let activityListeners: (() => void)[] = [];

    function attachActivityListeners() {
      const handler = () => resetIdleTimer();
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));
      activityListeners = events.map((ev) => () => window.removeEventListener(ev, handler));
    }

    function detachActivityListeners() {
      activityListeners.forEach((off) => off());
      activityListeners = [];
    }

    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setLoading(false);
      if (s) {
        scheduleExpiry(s);
        attachActivityListeners();
        resetIdleTimer();
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      clearAllTimers();
      detachActivityListeners();
      if (newSession) {
        scheduleExpiry(newSession);
        attachActivityListeners();
        resetIdleTimer();
      }
    });

    return () => {
      sub.subscription.unsubscribe();
      clearAllTimers();
      detachActivityListeners();
    };
  }, []);

  async function signOut() {
    clearAllTimers();
    await supabase.auth.signOut();
    setSession(null);
  }

  if (loading) {
    return (
      <div className="legacy-ui" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner dark />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
