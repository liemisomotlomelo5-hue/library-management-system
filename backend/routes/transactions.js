const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, b.title as book_title, u.name as user_name 
      FROM transactions t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST create transaction (borrow or return/add stock)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { book_id, user_id, type, quantity, notes } = req.body;

    if (!book_id || !type || !quantity) {
      await connection.rollback();
      return res.status(400).json({ error: 'book_id, type and quantity are required' });
    }

    if (!['borrow', 'return', 'add_stock'].includes(type)) {
      await connection.rollback();
      return res.status(400).json({ error: 'type must be borrow, return or add_stock' });
    }

    // Get current book stock
    const [books] = await connection.query('SELECT * FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[0];
    let newQuantity = book.quantity;

    if (type === 'borrow') {
      if (book.quantity < quantity) {
        await connection.rollback();
        return res.status(400).json({ error: 'Not enough stock available' });
      }
      newQuantity = book.quantity - quantity;
    } else if (type === 'return' || type === 'add_stock') {
      newQuantity = book.quantity + quantity;
    }

    // Update stock
    await connection.query('UPDATE books SET quantity = ? WHERE id = ?', [newQuantity, book_id]);

    // Insert transaction
    const [result] = await connection.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity, notes) VALUES (?, ?, ?, ?, ?)',
      [book_id, user_id || null, type, quantity, notes || null]
    );

    await connection.commit();

    const [newTx] = await pool.query(`
      SELECT t.*, b.title as book_title, u.name as user_name 
      FROM transactions t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [result.insertId]);

    res.status(201).json(newTx[0]);
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  } finally {
    connection.release();
  }
});

// GET transactions for a specific book
router.get('/book/:bookId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, b.title as book_title, u.name as user_name 
      FROM transactions t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.book_id = ?
      ORDER BY t.created_at DESC
    `, [req.params.bookId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch book transactions' });
  }
});

module.exports = router;
