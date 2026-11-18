const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all books
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET single book by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// POST create new book
router.post('/', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    
    if (!title || !author || !isbn) {
      return res.status(400).json({ error: 'Title, author and ISBN are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title, author, genre || null, isbn, quantity || 0]
    );

    const [newBook] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(newBook[0]);
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'ISBN already exists' });
    }
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    
    const [existing] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await pool.query(
      'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?',
      [
        title || existing[0].title,
        author || existing[0].author,
        genre !== undefined ? genre : existing[0].genre,
        isbn || existing[0].isbn,
        quantity !== undefined ? quantity : existing[0].quantity,
        req.params.id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
