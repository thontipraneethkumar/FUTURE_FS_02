// Creates (or resets) an admin account so you can log into the dashboard.
// Usage: npm run seed -- <username> <password>
// If no arguments are given, defaults to admin / admin123 (CHANGE THIS AFTER FIRST LOGIN).

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedAdmin() {
  const [, , usernameArg, passwordArg] = process.argv;
  const username = usernameArg || 'admin';
  const password = passwordArg || 'admin123';

  const password_hash = await bcrypt.hash(password, 10);

  const [existing] = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);

  if (existing.length > 0) {
    await pool.query('UPDATE admins SET password_hash = ? WHERE username = ?', [password_hash, username]);
    console.log(`Updated password for existing admin "${username}".`);
  } else {
    await pool.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, password_hash]);
    console.log(`Created new admin "${username}".`);
  }

  console.log(`Login with username: ${username} / password: ${password}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err.message);
  process.exit(1);
});
