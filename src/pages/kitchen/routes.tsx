import { Routes, Route } from 'react-router-dom';
import PinLogin from '../prep/PinLogin';
import StationCounter from '../prep/StationCounter';

export default function KitchenRoutes() {
  return (
    <Routes>
      <Route path="login" element={<PinLogin stationName="Kitchen" redirectTo="/kitchen" />} />
      <Route index element={<StationCounter station="kitchen" stationLabel="Kitchen" />} />
    </Routes>
  );
}
