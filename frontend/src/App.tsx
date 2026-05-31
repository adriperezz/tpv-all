import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getSession, isAdmin } from '@/store/auth';
import LoginPage from '@/pages/LoginPage';
import TpvPage from '@/pages/TpvPage';
import ConfigPage from '@/pages/ConfigPage';
import DashboardPage from '@/pages/DashboardPage';
import ProductosPage from '@/pages/ProductosPage';
import CierreCajaPage from '@/pages/CierreCajaPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getSession() ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!getSession()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/tpv" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tpv" element={<RequireAuth><TpvPage /></RequireAuth>} />
        <Route path="/config" element={<RequireAuth><ConfigPage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
        <Route path="/productos" element={<RequireAdmin><ProductosPage /></RequireAdmin>} />
        <Route path="/cierre" element={<RequireAuth><CierreCajaPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
