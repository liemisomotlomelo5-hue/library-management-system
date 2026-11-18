const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, membership_id, role, created_at FROM users ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST register / add new user
router.post('/', async (req, res) => {
  try {
    const { name, membership_id, role, password } = req.body;

    if (!name || !membership_id) {
      return res.status(400).json({ error: 'Name and membership ID are required' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const [result] = await pool.query(
      'INSERT INTO users (name, membership_id, role, password) VALUES (?, ?, ?, ?)',
      [name, membership_id, role || 'member', hashedPassword]
    );

    const [newUser] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Membership ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { membership_id, password } = req.body;

    if (!membership_id || !password) {
      return res.status(400).json({ error: 'Membership ID and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE membership_id = ?', [membership_id]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    if (!user.password) {
      return res.status(401).json({ error: 'No password set for this user' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, membership_id: user.membership_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        membership_id: user.membership_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { name, membership_id, role, password } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let hashedPassword = existing[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await pool.query(
      'UPDATE users SET name = ?, membership_id = ?, role = ?, password = ? WHERE id = ?',
      [
        name || existing[0].name,
        membership_id || existing[0].membership_id,
        role || existing[0].role,
        hashedPassword,
        req.params.id
      ]
    );

    const [updated] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
