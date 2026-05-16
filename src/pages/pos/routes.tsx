import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../../components/AuthGuard';
import PosLogin from './Login';
import ModeSelect from './ModeSelect';
import StationSelect from './StationSelect';
import SoloDashboard from './SoloDashboard';
import SoloCounter from './SoloCounter';
import Dashboard from './Dashboard';
import OrderDetail from './OrderDetail';
import CustomerDisplay from './CustomerDisplay';
import OpenStore from './OpenStore';
import CloseStore from './CloseStore';
import QRGenerator from './QRGenerator';

export default function PosRoutes() {
  return (
    <Routes>
      <Route path="login" element={<PosLogin />} />
      <Route path="mode" element={<AuthGuard><ModeSelect /></AuthGuard>} />
      <Route path="station" element={<StationSelect />} />
      <Route path="open" element={<AuthGuard><OpenStore /></AuthGuard>} />
      <Route path="close" element={<AuthGuard><CloseStore /></AuthGuard>} />
      <Route path="qr" element={<AuthGuard><QRGenerator /></AuthGuard>} />
      <Route path="solo" element={<AuthGuard><SoloDashboard /></AuthGuard>} />
      <Route path="solo/counter" element={<AuthGuard><SoloCounter /></AuthGuard>} />
      <Route path="dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="order/:id" element={<AuthGuard><OrderDetail /></AuthGuard>} />
      <Route path="customer-display" element={<CustomerDisplay />} />
    </Routes>
  );
}
