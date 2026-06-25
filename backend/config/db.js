// config/db.js
// Database connection configuration.
// Works locally with .env, and on Azure App Service using Application Settings
// (set these as environment variables in the Azure portal under
// Configuration > Application settings — no code change needed for deployment).

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecafe_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Azure Database for MySQL Flexible Server requires SSL by default
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;
