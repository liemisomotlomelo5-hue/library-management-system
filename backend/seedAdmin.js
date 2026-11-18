/**
 * Optional helper: creates a first admin account if none exists.
 * Prefer creating accounts through the app (Login → Create Account).
 *
 * Usage:
 *   node seedAdmin.js
 *   node seedAdmin.js myname MYID mypassword
 *
 * If no arguments are given it will not create anything — use the web form instead.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('No default login is created.');
    console.log('Open the app → "Create Account" and enter your own name, Membership ID and password.');
    console.log('');
    console.log('Or run with your own details:');
    console.log('  node seedAdmin.js "Your Name" YOURID yourpassword');
    process.exit(0);
  }

  const [name, membership_id, password] = args;

  try {
    const hash = await bcrypt.hash(password, 10);

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE membership_id = ?',
      [membership_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE users SET name = ?, role = ?, password = ? WHERE membership_id = ?',
        [name, 'admin', hash, membership_id]
      );
      console.log(`Updated ${membership_id} as admin.`);
    } else {
      await pool.query(
        'INSERT INTO users (name, membership_id, role, password) VALUES (?, ?, ?, ?)',
        [name, membership_id, 'admin', hash]
      );
      console.log(`Created admin: ${membership_id}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
