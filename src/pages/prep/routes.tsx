import { Routes, Route } from 'react-router-dom';
import PinLogin from './PinLogin';
import StationCounter from './StationCounter';

export default function PrepRoutes() {
  return (
    <Routes>
      <Route path="login" element={<PinLogin stationName="Prep Counter" redirectTo="/prep" />} />
      <Route index element={<StationCounter station="prep" stationLabel="Prep Counter" />} />
    </Routes>
  );
}
