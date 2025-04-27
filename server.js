const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

dotenv.config();
const app = express();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Render's PostgreSQL
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

// Create tables if they don't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    qr_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS replenishments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    discrepancies TEXT[],
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)
  .then(() => console.log('Tables created or already exist'))
  .catch(err => console.error('Error creating tables:', err.stack));

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));