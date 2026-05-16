import { Routes, Route } from 'react-router-dom';
import { SoloBackButton, useSoloMode } from '../../components/SoloBackButton';
import StoreGate from './StoreGate';
import KioskGate from './KioskGate';
import Intro from './Intro';
import Welcome from './Welcome';
import MenuBrowse from './MenuBrowse';
import ItemDetail from './ItemDetail';
import Cart from './Cart';
import Checkout from './Checkout';
import OrderConfirmed from './OrderConfirmed';
import MyOrders from './MyOrders';
import PayFirst from './PayFirst';

function KioskContent() {
  return (
    <Routes>
      <Route index element={<Intro />} />
      <Route path="welcome" element={<Welcome />} />
      <Route path="menu" element={<MenuBrowse />} />
      <Route path="menu/:id" element={<ItemDetail />} />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="confirmed" element={<OrderConfirmed />} />
      <Route path="my-orders" element={<MyOrders />} />
      <Route path="pay-first" element={<PayFirst />} />
    </Routes>
  );
}

export default function KioskRoutes() {
  const isSolo = useSoloMode();

  // Solo mode: store gate + no PIN (POS operator switching to kiosk)
  if (isSolo) {
    return (
      <StoreGate>
        <SoloBackButton />
        <KioskContent />
      </StoreGate>
    );
  }

  // In-store kiosk tablets: store gate + PIN protection
  return (
    <StoreGate>
      <KioskGate>
        <KioskContent />
      </KioskGate>
    </StoreGate>
  );
}
