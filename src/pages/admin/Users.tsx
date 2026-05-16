import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/adminService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { User, UserRole } from '../../types';
import styles from './Users.module.css';
import toast from 'react-hot-toast';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  station: string;
  pin: string;
  isActive: boolean;
}

const emptyForm: UserFormData = {
  name: '',
  email: '',
  role: 'cashier',
  station: 'POS',
  pin: '',
  isActive: true,
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      station: user.station ?? 'POS',
      pin: user.pin ?? '',
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        station: form.station,
        pin: form.pin,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateUser(editingId, data);
        toast.success('User updated.');
      } else {
        await createUser(data);
        toast.success('User created.');
      }
      setShowModal(false);
      load();
    } catch {
      toast.error('Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted.');
      load();
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  if (loading) return <LoadingSpinner />;

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    cashier: 'Cashier',
    prep_staff: 'Prep Staff',
    kitchen_staff: 'Kitchen Staff',
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <Button onClick={openNew}>+ Add User</Button>
      </div>

      {users.length === 0 ? (
        <div className={styles.emptyState}>No users yet.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Station</th>
              <th>PIN</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{roleLabels[user.role]}</td>
                <td>{user.station ?? '--'}</td>
                <td>
                  <span className={styles.pin}>{user.pin ?? '--'}</span>
                </td>
                <td>
                  <span
                    className={
                      user.isActive ? styles.statusActive : styles.statusInactive
                    }
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => openEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingId ? 'Edit User' : 'Add User'}
            </h2>

            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Role</label>
                <select
                  className={styles.select}
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as UserRole })
                  }
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="cashier">Cashier</option>
                  <option value="prep_staff">Prep Staff</option>
                  <option value="kitchen_staff">Kitchen Staff</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Station</label>
                <select
                  className={styles.select}
                  value={form.station}
                  onChange={(e) => setForm({ ...form, station: e.target.value })}
                >
                  <option value="POS">POS</option>
                  <option value="Prep">Prep</option>
                  <option value="Kitchen">Kitchen</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>PIN (4-digit)</label>
              <input
                className={styles.input}
                value={form.pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setForm({ ...form, pin: val });
                }}
                placeholder="0000"
                maxLength={4}
              />
            </div>

            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggle} ${form.isActive ? styles.toggleActive : ''}`}
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                type="button"
              >
                <div className={styles.toggleKnob} />
              </button>
              <span className={styles.toggleLabel}>Active</span>
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
