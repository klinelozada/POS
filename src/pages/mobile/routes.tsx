import { Routes, Route } from 'react-router-dom';
import StoreGate from '../kiosk/StoreGate';
import MobileGate from '../kiosk/MobileGate';
import Welcome from '../kiosk/Welcome';
import MenuBrowse from '../kiosk/MenuBrowse';
import ItemDetail from '../kiosk/ItemDetail';
import Cart from '../kiosk/Cart';
import Checkout from '../kiosk/Checkout';
import OrderConfirmed from '../kiosk/OrderConfirmed';
import MyOrders from '../kiosk/MyOrders';
import PayFirst from '../kiosk/PayFirst';
import PromoDetail from '../kiosk/PromoDetail';

function MobileContent() {
  return (
    <Routes>
      <Route index element={<Welcome />} />
      <Route path="menu" element={<MenuBrowse />} />
      <Route path="menu/:id" element={<ItemDetail />} />
      <Route path="promo/:id" element={<PromoDetail />} />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="confirmed" element={<OrderConfirmed />} />
      <Route path="my-orders" element={<MyOrders />} />
      <Route path="pay-first" element={<PayFirst />} />
    </Routes>
  );
}

export default function MobileRoutes() {
  // Customer mobile: store gate + location verification
  return (
    <StoreGate>
      <MobileGate>
        <MobileContent />
      </MobileGate>
    </StoreGate>
  );
}
