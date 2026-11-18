import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, createUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    name: '',
    membership_id: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.membership_id.trim() || !form.password) {
      setError('Please enter your Membership ID and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiLogin({
        membership_id: form.membership_id.trim(),
        password: form.password,
      });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.membership_id.trim()) {
      setError('Membership ID is required');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Create account (role defaults to 'member' on the backend)
      await createUser({
        name: form.name.trim(),
        membership_id: form.membership_id.trim(),
        password: form.password,
        role: 'member',
      });

      // Automatically log them in after successful registration
      const data = await apiLogin({
        membership_id: form.membership_id.trim(),
        password: form.password,
      });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. That Membership ID may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setForm({ name: '', membership_id: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>📚 Library System</h1>
        <p className="subtitle">
          {mode === 'login'
            ? 'Sign in with your own Membership ID and password'
            : 'Create your account with your own details'}
        </p>

        <div className="mode-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => switchMode('register')}
          >
            Create Account
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Membership ID</label>
              <input
                type="text"
                name="membership_id"
                value={form.membership_id}
                onChange={handleChange}
                placeholder="Enter your Membership ID"
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Membership ID</label>
              <input
                type="text"
                name="membership_id"
                value={form.membership_id}
                onChange={handleChange}
                placeholder="Choose a unique ID (e.g. STU123)"
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Choose a password (min 4 characters)"
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account & Sign In'}
            </button>
          </form>
        )}

        <p className="hint">
          {mode === 'login'
            ? "Don't have an account? Click \"Create Account\" above and enter your own details."
            : 'After creating your account you will be signed in automatically. An admin can later change your role if needed.'}
        </p>
      </div>
    </div>
  );
}
