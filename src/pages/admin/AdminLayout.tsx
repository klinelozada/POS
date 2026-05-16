import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './AdminLayout.module.css';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/menu', label: 'Menu', icon: 'restaurant_menu', end: false },
  { to: '/admin/categories', label: 'Categories', icon: 'category', end: false },
  { to: '/admin/orders', label: 'Orders', icon: 'receipt_long', end: false },
  { to: '/admin/users', label: 'Users', icon: 'people', end: false },
  { to: '/admin/promos', label: 'Promos', icon: 'local_offer', end: false },
  { to: '/admin/qr', label: 'QR Generator', icon: 'qr_code', end: false },
  { to: '/admin/settings', label: 'Settings', icon: 'settings', end: false },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/pos/login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Joe Street</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={`material-symbols-rounded ${styles.navIcon}`}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span className={`material-symbols-rounded ${styles.navIcon}`}>logout</span>
            Logout
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
