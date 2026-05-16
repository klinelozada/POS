import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import MenuManagement from './MenuManagement';
import ItemEditor from './ItemEditor';
import Categories from './Categories';
import CategoryEditor from './CategoryEditor';
import Orders from './Orders';
import Users from './Users';
import Promos from './Promos';
import QRGenerator from '../pos/QRGenerator';
import Settings from './Settings';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="menu/new" element={<ItemEditor />} />
        <Route path="menu/:id" element={<ItemEditor />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/new" element={<CategoryEditor />} />
        <Route path="categories/:id" element={<CategoryEditor />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} />
        <Route path="promos" element={<Promos />} />
        <Route path="qr" element={<QRGenerator />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
