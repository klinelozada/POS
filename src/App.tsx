import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthGuard } from './components/AuthGuard';

// Lazy-loaded route groups — each will be a module with its own sub-routes
const KioskRoutes = lazy(() => import('./pages/kiosk/routes'));
const MobileRoutes = lazy(() => import('./pages/mobile/routes'));
const PosRoutes = lazy(() => import('./pages/pos/routes'));
const PrepRoutes = lazy(() => import('./pages/prep/routes'));
const KitchenRoutes = lazy(() => import('./pages/kitchen/routes'));
const AdminRoutes = lazy(() => import('./pages/admin/routes'));

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'var(--font-primary)',
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/kiosk" replace />} />

          {/* Kiosk — in-store tablets, PIN-protected */}
          <Route path="/kiosk/*" element={<KioskRoutes />} />

          {/* Mobile — customer QR scan, location-gated */}
          <Route path="/m/*" element={<MobileRoutes />} />

          {/* POS — mixed auth (mode/station/login are public, dashboards are protected) */}
          <Route path="/pos/*" element={<PosRoutes />} />

          {/* Prep station — PIN auth */}
          <Route path="/prep/*" element={<PrepRoutes />} />

          {/* Kitchen station — PIN auth */}
          <Route path="/kitchen/*" element={<KitchenRoutes />} />

          {/* Admin — full auth required */}
          <Route
            path="/admin/*"
            element={
              <AuthGuard redirectTo="/pos/login">
                <AdminRoutes />
              </AuthGuard>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
