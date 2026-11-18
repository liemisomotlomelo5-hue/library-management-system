import { useState, useEffect } from 'react';
import { getBooks, getTransactions, createTransaction, getUsers } from '../services/api';
import './Transactions.css';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    book_id: '',
    user_id: '',
    type: 'borrow',
    quantity: 1,
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txData, bookData, userData] = await Promise.all([
        getTransactions(),
        getBooks(),
        getUsers().catch(() => []),
      ]);
      setTransactions(txData);
      setBooks(bookData);
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.book_id || !form.quantity) {
      setError('Book and quantity are required');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await createTransaction({
        book_id: parseInt(form.book_id, 10),
        user_id: form.user_id ? parseInt(form.user_id, 10) : null,
        type: form.type,
        quantity: form.quantity,
        notes: form.notes || null,
      });
      setSuccess(`Transaction (${form.type}) recorded successfully`);
      setForm({ book_id: '', user_id: '', type: 'borrow', quantity: 1, notes: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  const typeLabel = (type) => {
    const labels = { borrow: 'Borrowed', return: 'Returned', add_stock: 'Stock Added' };
    return labels[type] || type;
  };

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h2>Record Transaction</h2>
        <form onSubmit={handleSubmit} className="tx-form">
          <div className="form-row">
            <div className="form-group">
              <label>Book *</label>
              <select name="book_id" value={form.book_id} onChange={handleChange} required>
                <option value="">Select a book</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} (Stock: {b.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="borrow">Borrow (deduct stock)</option>
                <option value="return">Return (add stock)</option>
                <option value="add_stock">Add Stock</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>User (optional for borrow/return)</label>
              <select name="user_id" value={form.user_id} onChange={handleChange}>
                <option value="">None</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.membership_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Record Transaction
          </button>
        </form>
      </div>

      <h2>Transaction History</h2>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="tx-table-wrapper">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Book</th>
                <th>User</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.created_at)}</td>
                  <td>{tx.book_title || `Book #${tx.book_id}`}</td>
                  <td>{tx.user_name || '-'}</td>
                  <td>
                    <span className={`tx-badge ${tx.type}`}>{typeLabel(tx.type)}</span>
                  </td>
                  <td>{tx.quantity}</td>
                  <td>{tx.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <p className="empty">No transactions yet.</p>}
        </div>
      )}
    </div>
  );
}
