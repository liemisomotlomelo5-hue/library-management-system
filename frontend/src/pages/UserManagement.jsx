import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './UserManagement.css';

const emptyForm = { name: '', membership_id: '', role: 'member', password: '' };

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.membership_id.trim()) errors.membership_id = 'Membership ID is required';
    if (!editingId && !form.password) errors.password = 'Password is required for new users';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setError(null);
      setSuccess(null);
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      if (editingId) {
        await updateUser(editingId, payload);
        setSuccess('User updated successfully');
      } else {
        await createUser(payload);
        setSuccess('User added successfully');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      membership_id: user.membership_id,
      role: user.role,
      password: '',
    });
    setEditingId(user.id);
    setFormErrors({});
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      setSuccess('User deleted successfully');
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="user-management">
        <h1>User Management</h1>
        <p className="empty">You need admin or librarian privileges to manage users.</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h2>{editingId ? 'Update User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label>Membership ID *</label>
              <input
                type="text"
                name="membership_id"
                value={form.membership_id}
                onChange={handleChange}
              />
              {formErrors.membership_id && (
                <span className="field-error">{formErrors.membership_id}</span>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="member">Member</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>{editingId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              {formErrors.password && <span className="field-error">{formErrors.password}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update User' : 'Add User'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2>All Users</h2>
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-list">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>
                  <span className="tag">{user.role}</span>
                  <span>ID: {user.membership_id}</span>
                </p>
              </div>
              <div className="user-actions">
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(user)}>
                  Update
                </button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(user.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="empty">No users yet.</p>}
        </div>
      )}
    </div>
  );
}
