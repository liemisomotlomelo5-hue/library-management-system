const API_BASE = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Books
export const getBooks = () => request('/books');
export const getBook = (id) => request(`/books/${id}`);
export const createBook = (book) => request('/books', { method: 'POST', body: JSON.stringify(book) });
export const updateBook = (id, book) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(book) });
export const deleteBook = (id) => request(`/books/${id}`, { method: 'DELETE' });

// Transactions
export const getTransactions = () => request('/transactions');
export const createTransaction = (tx) => request('/transactions', { method: 'POST', body: JSON.stringify(tx) });
export const getBookTransactions = (bookId) => request(`/transactions/book/${bookId}`);

// Users
export const getUsers = () => request('/users');
export const getUser = (id) => request(`/users/${id}`);
export const createUser = (user) => request('/users', { method: 'POST', body: JSON.stringify(user) });
export const updateUser = (id, user) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });
export const login = (credentials) => request('/users/login', { method: 'POST', body: JSON.stringify(credentials) });
