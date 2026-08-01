// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();
// Create a connection pool (handles multiple concurrent requests efficiently)
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the database connection on startup
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connected to MySQL Database successfully!');
    connection.release(); // Return connection back to the pool
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
  }
})();


module.exports = db;