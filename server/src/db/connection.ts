import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../sultiai.db');
const DIALECT = process.env.DB_DIALECT || 'sqlite';

let db: ReturnType<typeof drizzle>;
let sqliteRaw: Database.Database | null = null;

function getDialect() {
  if (DIALECT === 'postgresql' || DIALECT === 'postgres') return 'postgres';
  if (DIALECT === 'mysql') return 'mysql';
  return 'sqlite';
}

function initDatabase() {
  if (!sqliteRaw) return;
  sqliteRaw.pragma('foreign_keys = ON');
  const tables = [
    `CREATE TABLE IF NOT EXISTS avatars (avatar_id INTEGER PRIMARY KEY AUTOINCREMENT, avatar_name TEXT NOT NULL, avatar_image TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, fullname TEXT NOT NULL, username TEXT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, avatar_id INTEGER DEFAULT 1, preferred_lang TEXT DEFAULT 'English', learning_lang TEXT DEFAULT 'Bisaya', country TEXT, role TEXT NOT NULL DEFAULT 'user', created_at TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS user_settings (setting_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, dark_mode INTEGER DEFAULT 0, speech_speed REAL DEFAULT 1.0, voice_gender TEXT DEFAULT 'neutral', FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS saved_phrases (phrase_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, phrase TEXT NOT NULL, language TEXT, category TEXT, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS notifications (notify_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT, message TEXT, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS feedback (feedback_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, functionality INTEGER DEFAULT 0, usability INTEGER DEFAULT 0, reliability INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS conversations (conversation_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS conversation_messages (message_id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER NOT NULL, sender TEXT NOT NULL DEFAULT 'user', message TEXT, translated_message TEXT, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS speech_records (speech_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, audio_path TEXT, recognized_text TEXT, language_detected TEXT, confidence REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS translations (translation_id INTEGER PRIMARY KEY AUTOINCREMENT, speech_id INTEGER NOT NULL, source_language TEXT, target_language TEXT, translated_text TEXT, FOREIGN KEY (speech_id) REFERENCES speech_records(speech_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS phrase_recommendations (recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT, speech_id INTEGER NOT NULL, recommended_phrase TEXT, intent TEXT, confidence REAL DEFAULT 0, FOREIGN KEY (speech_id) REFERENCES speech_records(speech_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS learning_modules (module_id INTEGER PRIMARY KEY AUTOINCREMENT, module_title TEXT NOT NULL, difficulty TEXT DEFAULT 'beginner', language TEXT, created_at TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS learning_progress (progress_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, module_id INTEGER NOT NULL, completion_percent REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, FOREIGN KEY (module_id) REFERENCES learning_modules(module_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS community_posts (post_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT, content TEXT, phrase TEXT, translation TEXT, category TEXT, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS comments (comment_id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, comment TEXT, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS learner_profiles (profile_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, level TEXT DEFAULT 'beginner', strengths TEXT, weak_areas TEXT, common_mistakes TEXT, total_xp INTEGER DEFAULT 0, coins INTEGER DEFAULT 0, streak INTEGER DEFAULT 0, daily_xp INTEGER DEFAULT 0, daily_goal INTEGER DEFAULT 50, total_sessions INTEGER DEFAULT 0, last_active TEXT, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS tutor_sessions (session_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, messages TEXT, summary TEXT, started_at TEXT DEFAULT (datetime('now')), ended_at TEXT, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS daily_activity (activity_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, activity_date TEXT NOT NULL, xp_earned INTEGER DEFAULT 0, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS user_achievements (user_achievement_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, achievement_id TEXT NOT NULL, unlocked_at TEXT, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, UNIQUE(user_id, achievement_id))`,
    `CREATE TABLE IF NOT EXISTS user_badges (user_badge_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, badge_id TEXT NOT NULL, earned_at TEXT, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, UNIQUE(user_id, badge_id))`,
  ];
  for (const sql of tables) {
    sqliteRaw.exec(sql);
  }
  const addColumnMigrations: Array<{ table: string; column: string; sql: string }> = [
    { table: 'learner_profiles', column: 'coins', sql: 'ALTER TABLE learner_profiles ADD COLUMN coins INTEGER DEFAULT 0' },
    { table: 'learner_profiles', column: 'streak', sql: 'ALTER TABLE learner_profiles ADD COLUMN streak INTEGER DEFAULT 0' },
    { table: 'learner_profiles', column: 'daily_xp', sql: 'ALTER TABLE learner_profiles ADD COLUMN daily_xp INTEGER DEFAULT 0' },
    { table: 'learner_profiles', column: 'daily_goal', sql: 'ALTER TABLE learner_profiles ADD COLUMN daily_goal INTEGER DEFAULT 50' },
  ];
  for (const m of addColumnMigrations) {
    const cols = sqliteRaw.prepare(`PRAGMA table_info(${m.table})`).all() as Array<{ name: string }>;
    if (!cols.some((c) => c.name === m.column)) {
      sqliteRaw.exec(m.sql);
    }
  }
  const avatarRow = sqliteRaw.prepare('SELECT 1 FROM avatars WHERE avatar_id = 1').get();
  if (!avatarRow) {
    sqliteRaw.prepare('INSERT INTO avatars (avatar_id, avatar_name, avatar_image) VALUES (1, ?, ?)').run('Default', 'https://api.dicebear.com/7.x/avataaars/svg?seed=default');
  }
  console.log('Database tables initialized');
}

export function connect() {
  const dialect = getDialect();

  if (dialect === 'sqlite') {
    sqliteRaw = new Database(DB_PATH);
    sqliteRaw.pragma('journal_mode = WAL');
    initDatabase();
    const schema = require('./schema-sqlite');
    db = drizzle(sqliteRaw, { schema });
    console.log(`SQLite connected: ${DB_PATH} (dialect: ${DIALECT})`);
    return db;
  }

  if (dialect === 'postgres') {
    const { Pool } = require('pg');
    const { drizzle: drizzlePg } = require('drizzle-orm/node-postgres');
    const schema = require('./schema-pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/sultiai' });
    db = drizzlePg(pool, { schema });
    console.log(`PostgreSQL connected (dialect: ${DIALECT})`);
    return db;
  }

  if (dialect === 'mysql') {
    const mysql = require('mysql2/promise');
    const { drizzle: drizzleMysql } = require('drizzle-orm/mysql2');
    const schema = require('./schema-pg');
    const pool = mysql.createPool({ uri: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/sultiai' });
    db = drizzleMysql(pool, { schema });
    console.log(`MySQL connected (dialect: ${DIALECT})`);
    return db;
  }

  throw new Error(`Unknown dialect: ${dialect}`);
}

export function getDb() {
  if (!db) throw new Error('Database not connected. Call connect() first.');
  return db;
}

export function getSqliteRaw(): Database.Database | null {
  return sqliteRaw;
}

export function getDialectName() {
  return getDialect();
}

export async function closeAll() {
  if (sqliteRaw) sqliteRaw.close();
}
