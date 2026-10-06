const { Pool } = require('pg');

const POOL_MAX_SIZE = 5;
const POOL_TIMEOUT_MS = 5000;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://inventory:inventory@localhost:5432/inventory',
  max: POOL_MAX_SIZE,
  connectionTimeoutMillis: POOL_TIMEOUT_MS,
});

pool.on('error', (err) => {
  console.error('idle database client error:', err.message);
});

function poolStats() {
  return {
    max: pool.options.max,
    total: pool.totalCount,
    active: pool.totalCount - pool.idleCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

module.exports = { pool, poolStats };
