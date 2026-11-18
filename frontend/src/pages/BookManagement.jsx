import { useState, useEffect } from 'react';
import { getBooks, createBook, updateBook, deleteBook } from '../services/api';
import './BookManagement.css';

const emptyForm = { title: '', author: '', genre: '', isbn: '', quantity: 0 };

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.author.trim()) errors.author = 'Author is required';
    if (!form.isbn.trim()) errors.isbn = 'ISBN is required';
    if (form.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setError(null);
      setSuccess(null);
      if (editingId) {
        await updateBook(editingId, form);
        setSuccess('Book updated successfully');
      } else {
        await createBook(form);
        setSuccess('Book added successfully');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre || '',
      isbn: book.isbn,
      quantity: book.quantity,
    });
    setEditingId(book.id);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook(id);
      setSuccess('Book deleted successfully');
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="book-management">
      <h1>Book Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h2>{editingId ? 'Update Book' : 'Add New Book'}</h2>
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Book title"
              />
              {formErrors.title && <span className="field-error">{formErrors.title}</span>}
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Author name"
              />
              {formErrors.author && <span className="field-error">{formErrors.author}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                name="genre"
                value={form.genre}
                onChange={handleChange}
                placeholder="e.g. Fiction"
              />
            </div>
            <div className="form-group">
              <label>ISBN *</label>
              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="ISBN number"
              />
              {formErrors.isbn && <span className="field-error">{formErrors.isbn}</span>}
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="0"
              />
              {formErrors.quantity && <span className="field-error">{formErrors.quantity}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Book' : 'Add Book'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2>All Books</h2>
      {loading ? (
        <div className="loading">Loading books...</div>
      ) : (
        <div className="books-list">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <p className="meta">
                  {book.genre && <span className="tag">{book.genre}</span>}
                  <span>ISBN: {book.isbn}</span>
                  <span className={book.quantity < 2 ? 'qty low' : 'qty'}>
                    Qty: {book.quantity}
                  </span>
                </p>
              </div>
              <div className="book-actions">
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(book)}>
                  Update
                </button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(book.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {books.length === 0 && <p className="empty">No books yet. Add one above.</p>}
        </div>
      )}
    </div>
  );
}
