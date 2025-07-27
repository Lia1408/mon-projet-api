// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'etudiants_maroc',
  password: 'Pengd!!23', 
  port: 5433,  
});

module.exports = pool;
