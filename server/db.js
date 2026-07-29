const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'sultiai.db');

let sqliteDb;
let mysqlPool;

function initSqlite() {
  sqliteDb = new Database(DB_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  console.log('SQLite connected:', DB_PATH);
  return sqliteDb;
}

async function initMysql() {
  const host = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || process.env.DB_USER || 'root';
  const password = process.env.MYSQL_PASS || process.env.DB_PASS || '';
  const database = process.env.MYSQL_DB || process.env.DB_NAME || 'sultiai';

  if (!process.env.MYSQL_HOST && !process.env.DB_HOST) {
    console.log('MySQL not configured, skipping');
    return null;
  }

  try {
    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    const conn = await mysqlPool.getConnection();
    conn.release();
    console.log('MySQL connected:', `${user}@${host}:${port}/${database}`);
    return mysqlPool;
  } catch (err) {
    console.warn('MySQL connection failed:', err.message);
    console.warn('Server will continue with SQLite only');
    return null;
  }
}

function getSqlite() {
  return sqliteDb;
}

function getMysql() {
  return mysqlPool;
}

function isMysqlConnected() {
  return mysqlPool !== null && mysqlPool !== undefined;
}

async function closeAll() {
  if (sqliteDb) sqliteDb.close();
  if (mysqlPool) await mysqlPool.end();
}

module.exports = { initSqlite, initMysql, getSqlite, getMysql, isMysqlConnected, closeAll };
