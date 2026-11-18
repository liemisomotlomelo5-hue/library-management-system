import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BookManagement from './pages/BookManagement';
import Transactions from './pages/Transactions';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<BookManagement />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
