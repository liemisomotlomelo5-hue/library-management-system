import { useState, useEffect } from 'react';
import { getBooks } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lowStockBooks = books.filter((b) => b.quantity < 2);
  const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
  const uniqueTitles = books.length;

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Titles</h3>
          <p className="stat-number">{uniqueTitles}</p>
        </div>
        <div className="stat-card">
          <h3>Total Copies</h3>
          <p className="stat-number">{totalBooks}</p>
        </div>
        <div className="stat-card warning">
          <h3>Low Stock</h3>
          <p className="stat-number">{lowStockBooks.length}</p>
        </div>
      </div>

      <h2>Book Availability</h2>
      {lowStockBooks.length > 0 && (
        <div className="low-stock-alert">
          ⚠️ {lowStockBooks.length} book(s) have fewer than 2 copies in stock
        </div>
      )}

      <div className="books-table-wrapper">
        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>ISBN</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className={book.quantity < 2 ? 'low-stock-row' : ''}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre || '-'}</td>
                <td>{book.isbn}</td>
                <td className={book.quantity < 2 ? 'qty-low' : ''}>{book.quantity}</td>
                <td>
                  {book.quantity === 0 ? (
                    <span className="badge out">Out of Stock</span>
                  ) : book.quantity < 2 ? (
                    <span className="badge low">Low Stock</span>
                  ) : (
                    <span className="badge available">Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {books.length === 0 && <p className="empty">No books in the library yet.</p>}
    </div>
  );
}
