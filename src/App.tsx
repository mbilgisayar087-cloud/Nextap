import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/ui/Toast';
import RequireAuth from './components/layout/RequireAuth';
import AdminLayout from './components/layout/AdminLayout';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Businesses from './pages/admin/Businesses';
import BusinessEditor from './pages/admin/BusinessEditor';
import NfcCards from './pages/admin/NfcCards';
import Categories from './pages/admin/Categories';
import Settings from './pages/admin/Settings';

import PublicBusinessPage from './pages/public/PublicBusinessPage';
import PreviewBusinessPage from './pages/public/PreviewBusinessPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public — no auth, no admin chrome */}
            <Route path="/k/preview/:businessId" element={<PreviewBusinessPage />} />
            <Route path="/k/:cardCode" element={<PublicBusinessPage />} />

            {/* Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="businesses" element={<Businesses />} />
              <Route path="businesses/:id" element={<BusinessEditor />} />
              <Route path="nfc-cards" element={<NfcCards />} />
              <Route path="categories" element={<Categories />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
