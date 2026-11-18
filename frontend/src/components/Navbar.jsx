import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">📚 Library Manager</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/books">Books</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        {isAdmin && <li><Link to="/users">Users</Link></li>}
        {user ? (
          <li className="user-info">
            <span>{user.name} ({user.role})</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}
