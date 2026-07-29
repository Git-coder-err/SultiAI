const http = require('http');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const path = require('path');
const { initSqlite, initMysql, getSqlite, getMysql, isMysqlConnected } = require('./db');
const { initMysqlSchema } = require('./init-mysql');

try {
  const fs = require('fs');
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const k = trimmed.slice(0, eqIdx).trim();
        let v = trimmed.slice(eqIdx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        process.env[k] = process.env[k] || v;
      }
    }
  }
} catch {}

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'sultiai.db');

let db;
let mysql;

function parseJSON(body) {
  try { return JSON.parse(body); } catch { return null; }
}

function base64url(text) {
  return Buffer.from(text).toString('base64url');
}

function signToken(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + body).digest('base64url');
  return header + '.' + body + '.' + signature;
}

function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(parts[0] + '.' + parts[1]).digest('base64url');
    if (sig !== parts[2]) return null;
    const data = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return password === stored;
  const [salt, hash] = stored.split(':');
  const verify = crypto.scryptSync(password, salt, 64).toString('hex');
  return verify === hash;
}

function initDatabase() {
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS avatars (
      avatar_id INTEGER PRIMARY KEY AUTOINCREMENT,
      avatar_name TEXT NOT NULL,
      avatar_image TEXT NOT NULL
    )
  `);

  const avatarRow = db.prepare('SELECT 1 FROM avatars WHERE avatar_id = 1').get();
  if (!avatarRow) {
    db.prepare('INSERT INTO avatars (avatar_id, avatar_name, avatar_image) VALUES (1, ?, ?)').run('Default', 'https://api.dicebear.com/7.x/avataaars/svg?seed=default');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL,
      username TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_id INTEGER DEFAULT 1,
      preferred_lang TEXT DEFAULT 'English',
      learning_lang TEXT DEFAULT 'Bisaya',
      country TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (avatar_id) REFERENCES avatars(avatar_id) ON DELETE SET NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      dark_mode INTEGER DEFAULT 0,
      speech_speed REAL DEFAULT 1.0,
      voice_gender TEXT DEFAULT 'neutral',
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_phrases (
      phrase_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      phrase TEXT NOT NULL,
      language TEXT,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      notify_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      functionality INTEGER DEFAULT 0,
      usability INTEGER DEFAULT 0,
      reliability INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      conversation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      message_id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender TEXT NOT NULL DEFAULT 'user',
      message TEXT,
      translated_message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS speech_records (
      speech_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      audio_path TEXT,
      recognized_text TEXT,
      language_detected TEXT,
      confidence REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS translations (
      translation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      speech_id INTEGER NOT NULL,
      source_language TEXT,
      target_language TEXT,
      translated_text TEXT,
      FOREIGN KEY (speech_id) REFERENCES speech_records(speech_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS phrase_recommendations (
      recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      speech_id INTEGER NOT NULL,
      recommended_phrase TEXT,
      intent TEXT,
      confidence REAL DEFAULT 0,
      FOREIGN KEY (speech_id) REFERENCES speech_records(speech_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_modules (
      module_id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_title TEXT NOT NULL,
      difficulty TEXT DEFAULT 'beginner',
      language TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_progress (
      progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      completion_percent REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES learning_modules(module_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS community_posts (
      post_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      content TEXT,
      phrase TEXT,
      translation TEXT,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS learner_profiles (
      profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      level TEXT DEFAULT 'beginner',
      strengths TEXT,
      weak_areas TEXT,
      common_mistakes TEXT,
      total_xp INTEGER DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      last_active TEXT,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tutor_sessions (
      session_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      messages TEXT,
      summary TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      ended_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized');
}

function send(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const MAX_SIZE = 10_485_760;
    const contentLength = parseInt(req.headers['content-length'], 10);
    if (contentLength > MAX_SIZE) {
      req.destroy(new Error('Request body too large'));
      return reject(new Error('Request body too large'));
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_SIZE) {
        req.destroy(new Error('Request body too large'));
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 200, {});
    return;
  }

  const host = req.headers.host || 'localhost:3001';
  const url = new URL(req.url, `http://${host}`);
  const pathname = url.pathname.replace(/\/+$/, '');

  if (pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return send(res, 400, { error: 'Failed to read request body' });
  }

  const data = body ? parseJSON(body) : null;

  try {
    // Auth
    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const { email, password, name, native_language = 'English', target_language = 'Bisaya' } = data || {};
      if (!email || !password) return send(res, 400, { error: 'Email and password required' });
      const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
      if (existing) return send(res, 409, { error: 'Account already exists' });
      const fullname = name || email.split('@')[0];
      const username = fullname.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString(36);
      const result = db.prepare('INSERT INTO users (fullname, username, email, password_hash, preferred_lang, learning_lang) VALUES (?, ?, ?, ?, ?, ?)').run(fullname, username, email, hashPassword(password), native_language, target_language);
      const userId = Number(result.lastInsertRowid);
      db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
      const token = signToken({ email, userId });
      return send(res, 200, { message: 'User registered successfully', token, user: { name: fullname, email, native_language, target_language } });
    }

    if (pathname === '/api/auth/signin' && req.method === 'POST') {
      const { email, password } = data || {};
      if (!email || !password) return send(res, 400, { error: 'Email and password required' });
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user || !verifyPassword(password, user.password_hash)) return send(res, 401, { error: 'Invalid credentials' });
      const token = signToken({ email, userId: user.user_id });
      return send(res, 200, { token, user: { name: user.fullname, email, native_language: user.preferred_lang || 'English', target_language: user.learning_lang || 'Bisaya' } });
    }

    // Authenticated endpoints
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const session = token ? verifyToken(token) : null;

    if (!session) {
      if (pathname.startsWith('/api/')) return send(res, 401, { error: 'Access token required' });
      return send(res, 404, { error: 'Not found' });
    }

    // User profile
    if (pathname === '/api/users/me' && req.method === 'GET') {
      const user = db.prepare('SELECT u.user_id, u.fullname, u.username, u.email, u.preferred_lang, u.learning_lang, u.country, u.role, u.created_at, a.avatar_name, a.avatar_image FROM users u LEFT JOIN avatars a ON u.avatar_id = a.avatar_id WHERE u.email = ?').get(session.email);
      if (!user) return send(res, 404, { error: 'User not found' });
      return send(res, 200, { name: user.fullname, email: user.email, native_language: user.preferred_lang || 'English', target_language: user.learning_lang || 'Bisaya', username: user.username, country: user.country, role: user.role, avatar: { name: user.avatar_name, image: user.avatar_image }, created_at: user.created_at });
    }

    if (pathname === '/api/users/me' && req.method === 'PUT') {
      const { name, native_language, target_language, username, country, avatar_id } = data || {};
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(session.email);
      if (!user) return send(res, 404, { error: 'User not found' });
      const updatedFullname = name !== undefined ? name : user.fullname;
      const updatedPreferred = native_language !== undefined ? native_language : user.preferred_lang;
      const updatedLearning = target_language !== undefined ? target_language : user.learning_lang;
      const updatedUsername = username !== undefined ? username : user.username;
      const updatedCountry = country !== undefined ? country : user.country;
      const updatedAvatar = avatar_id !== undefined ? avatar_id : user.avatar_id;
      db.prepare('UPDATE users SET fullname = ?, preferred_lang = ?, learning_lang = ?, username = ?, country = ?, avatar_id = ? WHERE email = ?').run(updatedFullname, updatedPreferred, updatedLearning, updatedUsername, updatedCountry, updatedAvatar, session.email);
      return send(res, 200, { name: updatedFullname, email: session.email, native_language: updatedPreferred || 'English', target_language: updatedLearning || 'Bisaya' });
    }

    // History
    if (pathname === '/api/history' && req.method === 'GET') {
      const convos = db.prepare('SELECT c.conversation_id, c.title, c.created_at, m.sender, m.message, m.translated_message FROM conversations c LEFT JOIN conversation_messages m ON c.conversation_id = m.conversation_id WHERE c.user_id = (SELECT user_id FROM users WHERE email = ?) ORDER BY c.created_at DESC').all(session.email);
      const convoMap = new Map();
      for (const row of convos) {
        if (!convoMap.has(row.conversation_id)) {
          convoMap.set(row.conversation_id, { id: String(row.conversation_id), title: row.title, messages: [], createdAt: row.created_at });
        }
        if (row.message) {
          convoMap.get(row.conversation_id).messages.push({ type: row.sender, text: row.message });
        }
      }
      return send(res, 200, Array.from(convoMap.values()));
    }

    if (pathname.startsWith('/api/history/') && req.method === 'DELETE') {
      const historyId = pathname.split('/api/history/')[1];
      db.prepare('DELETE FROM conversations WHERE conversation_id = ? AND user_id = (SELECT user_id FROM users WHERE email = ?)').run(historyId, session.email);
      return send(res, 200, { message: 'History deleted successfully' });
    }

    // Conversations
    if (pathname === '/api/conversations' && req.method === 'GET') {
      const convos = db.prepare('SELECT c.conversation_id, c.title, c.created_at, m.sender, m.message, m.translated_message FROM conversations c LEFT JOIN conversation_messages m ON c.conversation_id = m.conversation_id WHERE c.user_id = (SELECT user_id FROM users WHERE email = ?) ORDER BY c.created_at DESC').all(session.email);
      const convoMap = new Map();
      for (const row of convos) {
        if (!convoMap.has(row.conversation_id)) {
          convoMap.set(row.conversation_id, { id: String(row.conversation_id), title: row.title, messages: [], createdAt: row.created_at });
        }
        if (row.message) {
          convoMap.get(row.conversation_id).messages.push({ type: row.sender, text: row.message });
        }
      }
      return send(res, 200, Array.from(convoMap.values()));
    }

    if (pathname === '/api/conversations' && req.method === 'POST') {
      const { messages, title } = data || {};
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      const convResult = db.prepare('INSERT INTO conversations (user_id, title) VALUES (?, ?)').run(userId, title || null);
      const conversationId = Number(convResult.lastInsertRowid);
      if (messages && Array.isArray(messages)) {
        const insertMsg = db.prepare('INSERT INTO conversation_messages (conversation_id, sender, message) VALUES (?, ?, ?)');
        for (const msg of messages) {
          insertMsg.run(conversationId, msg.type || 'user', msg.text || '');
        }
      }
      return send(res, 200, { id: String(conversationId), title: title || null, messages: messages || [], createdAt: new Date().toISOString() });
    }

    // Community resources
    if (pathname === '/api/community/resources' && req.method === 'GET') {
      const rows = db.prepare('SELECT cp.*, u.fullname AS author_name FROM community_posts cp LEFT JOIN users u ON cp.user_id = u.user_id ORDER BY cp.created_at DESC').all();
      return send(res, 200, rows.map(r => ({ id: String(r.post_id), phrase: r.phrase, translation: r.translation, category: r.category, title: r.title, content: r.content, created_by: r.author_name, createdAt: r.created_at })));
    }

    if (pathname === '/api/community/resources' && req.method === 'POST') {
      const { phrase, translation, category, title, content } = data || {};
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      const result = db.prepare('INSERT INTO community_posts (user_id, title, content, phrase, translation, category) VALUES (?, ?, ?, ?, ?, ?)').run(userId, title || null, content || null, phrase || null, translation || null, category || null);
      return send(res, 200, { id: String(result.lastInsertRowid), phrase, translation, category, title, content, created_by: session.email, createdAt: new Date().toISOString() });
    }

    // Translation
    if (pathname === '/api/translation/translate' && req.method === 'POST') {
      const { text, from, to } = data || {};
      if (!text || !from || !to) return send(res, 400, { error: 'Missing required fields' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });
      const apiMessages = [
        { role: 'system', content: `You are a professional translator. Translate the given text from ${from} to ${to}. Only return the translation, no additional text.` },
        { role: 'user', content: text }
      ];
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.3, max_tokens: 500 }),
      });
      if (!groqRes.ok) return send(res, 500, { error: 'Translation failed' });
      const groqData = await groqRes.json();
      return send(res, 200, { translated_text: groqData.choices[0].message.content });
    }

    // Phrases
    if (pathname === '/api/phrases/recommend' && req.method === 'POST') {
      const { situation, language } = data || {};
      if (!situation || !language) return send(res, 400, { error: 'Missing required fields' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });
      const apiMessages = [
        { role: 'system', content: `You are a language learning assistant. Provide 5 useful phrases for the given situation in ${language}. Return ONLY a JSON array of phrases, no other text.` },
        { role: 'user', content: `Situation: ${situation}` }
      ];
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.8, max_tokens: 500 }),
      });
      if (!groqRes.ok) return send(res, 500, { error: 'Failed to get recommendations' });
      const groqData = await groqRes.json();
      try {
        const phrases = JSON.parse(groqData.choices[0].message.content);
        return send(res, 200, { phrases });
      } catch {
        return send(res, 200, { phrases: [groqData.choices[0].message.content] });
      }
    }

    // Speech transcription
    if (pathname === '/api/speech/transcribe' && req.method === 'POST') {
      const { audio, language } = data || {};
      if (!audio) return send(res, 400, { error: 'Audio data is required' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });

      try {
        const audioBuffer = Buffer.from(audio, 'base64');
        const boundary = `----FormBoundary${Date.now()}`;
        const filename = language === 'tl' ? 'recording.mp3' : 'recording.m4a';
        const mimeType = language === 'tl' ? 'audio/mpeg' : 'audio/mp4';
        const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`);
        const footer = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n--${boundary}--`);
        const multipartBody = Buffer.concat([header, audioBuffer, footer]);

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
          body: multipartBody,
        });

        if (!groqRes.ok) {
          console.error('Groq Whisper error:', await groqRes.text());
          return send(res, 500, { error: 'Transcription failed' });
        }

        const groqData = await groqRes.json();
        return send(res, 200, { text: groqData.text });
      } catch (err) {
        console.error('Transcription error:', err);
        return send(res, 500, { error: 'Transcription failed' });
      }
    }

    // NLP analysis
    if (pathname === '/api/nlp/analyze' && req.method === 'POST') {
      const { text } = data || {};
      if (!text) return send(res, 400, { error: 'Text is required' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });
      const systemPrompt = `You are a natural language processing engine. Analyze the given text and return ONLY a valid JSON object (no other text) with exactly these fields:\n- "intent": the user's intent (e.g., "greeting", "question", "translation_request", "practice_request", "general_query")\n- "emotion": detected emotion ("neutral", "happy", "frustrated", "curious", "confused")\n- "context": brief context description (e.g., "language learning", "greeting practice", "translation help")\n- "language_detected": what language the text is in\n- "is_bisaya_related": boolean - whether the text relates to Bisaya/Cebuano language\n- "confidence": number between 0.0 and 1.0`;
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this text: "${text.substring(0, 1000)}"` }
      ];
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.1, max_tokens: 300 }),
        });
        if (!groqRes.ok) return send(res, 500, { error: 'NLP analysis failed' });
        const groqData = await groqRes.json();
        try {
          const result = JSON.parse(groqData.choices[0].message.content);
          return send(res, 200, result);
        } catch {
          return send(res, 200, { intent: "general_query", emotion: "neutral", context: "language learning", language_detected: "unknown", is_bisaya_related: false, confidence: 0 });
        }
      } catch (err) {
        console.error('NLP error:', err);
        return send(res, 500, { error: 'NLP analysis failed' });
      }
    }

    // Language detection
    if (pathname === '/api/language/detect' && req.method === 'POST') {
      const { text } = data || {};
      if (!text) return send(res, 400, { error: 'Text is required' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });
      const systemPrompt = `You are a language detection expert. Analyze the given text and determine what language it is written in.\nReturn ONLY a valid JSON object (no other text) with exactly these fields:\n- "language": full name (e.g., "Bisaya (Cebuano)", "English", "Filipino (Tagalog)")\n- "code": short code ("ceb", "en", "tl", "other")\n- "isBisaya": boolean - true if the text is primarily Bisaya/Cebuano\n- "confidence": number between 0.0 and 1.0`;
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this text: "${text.substring(0, 500)}"` }
      ];
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.1, max_tokens: 200 }),
      });
      if (!groqRes.ok) return send(res, 500, { error: 'Language detection failed' });
      const groqData = await groqRes.json();
      try {
        const result = JSON.parse(groqData.choices[0].message.content);
        return send(res, 200, result);
      } catch {
        return send(res, 200, { language: "unknown", code: "unknown", isBisaya: false, confidence: 0 });
      }
    }

    // Pronunciation
    if (pathname === '/api/pronunciation/check' && req.method === 'POST') {
      const { text } = data || {};
      if (!text) return send(res, 400, { error: 'Text is required' });
      if (!GROQ_API_KEY) return send(res, 200, { score: 85, feedback: "Good pronunciation! Keep practicing the vowel sounds.", note: "Groq API key not configured for detailed analysis" });
      const systemPrompt = 'You are a Bisaya (Cebuano) pronunciation coach. Analyze the given text.\nReturn ONLY a valid JSON object with exactly these fields:\n- "score": number 0-100\n- "feedback": string with specific sound corrections\n- "phoneme_breakdown": array of {"expected": string, "heard": string, "correct": boolean, "tip": string}\n\nBisaya pronunciation rules:\n- "a" is "ah" like in "father"\n- "e" is "eh" like in "bed"\n- "i" is "ee" like in "see"\n- "o" is "oh" like in "slow"\n- "u" is "oo" like in "food"\n- "ng" is a single sound like in "singing"';
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Pronunciation text: "${text}"` }
      ];
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.5, max_tokens: 300 }),
        });
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          try {
            const result = JSON.parse(groqData.choices[0].message.content);
            return send(res, 200, result);
          } catch {
            return send(res, 200, { score: 88, feedback: groqData.choices[0].message.content });
          }
        }
      } catch {}
      return send(res, 200, { score: 85, feedback: "Great effort! Practice speaking slowly and clearly." });
    }

    // Settings
    if (pathname === '/api/settings/language' && req.method === 'PUT') {
      const { native_language, learning_language } = data || {};
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(session.email);
      if (!user) return send(res, 404, { error: 'User not found' });
      const updatedPreferred = native_language !== undefined ? native_language : user.preferred_lang;
      const updatedLearning = learning_language !== undefined ? learning_language : user.learning_lang;
      db.prepare('UPDATE users SET preferred_lang = ?, learning_lang = ? WHERE email = ?').run(updatedPreferred, updatedLearning, session.email);
      return send(res, 200, { message: 'Settings updated successfully', native_language: updatedPreferred, learning_language: updatedLearning });
    }

    // User settings
    if (pathname === '/api/user/settings' && req.method === 'GET') {
      const row = db.prepare('SELECT us.* FROM user_settings us JOIN users u ON us.user_id = u.user_id WHERE u.email = ?').get(session.email);
      if (!row) return send(res, 200, { dark_mode: false, speech_speed: 1.0, voice_gender: 'neutral' });
      return send(res, 200, row);
    }

    if (pathname === '/api/user/settings' && req.method === 'PUT') {
      const { dark_mode, speech_speed, voice_gender } = data || {};
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      db.prepare('UPDATE user_settings SET dark_mode = COALESCE(?, dark_mode), speech_speed = COALESCE(?, speech_speed), voice_gender = COALESCE(?, voice_gender) WHERE user_id = ?').run(dark_mode ?? null, speech_speed ?? null, voice_gender ?? null, userId);
      return send(res, 200, { message: 'Settings updated successfully' });
    }

    // Saved phrases
    if (pathname === '/api/saved-phrases' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM saved_phrases WHERE user_id = (SELECT user_id FROM users WHERE email = ?) ORDER BY created_at DESC').all(session.email);
      return send(res, 200, rows);
    }

    if (pathname === '/api/saved-phrases' && req.method === 'POST') {
      const { phrase, language, category } = data || {};
      if (!phrase) return send(res, 400, { error: 'Phrase is required' });
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      const result = db.prepare('INSERT INTO saved_phrases (user_id, phrase, language, category) VALUES (?, ?, ?, ?)').run(userId, phrase, language || null, category || null);
      return send(res, 200, { phrase_id: result.lastInsertRowid, phrase, language, category });
    }

    if (pathname.startsWith('/api/saved-phrases/') && req.method === 'DELETE') {
      const phraseId = pathname.split('/api/saved-phrases/')[1];
      db.prepare('DELETE FROM saved_phrases WHERE phrase_id = ? AND user_id = (SELECT user_id FROM users WHERE email = ?)').run(phraseId, session.email);
      return send(res, 200, { message: 'Phrase deleted successfully' });
    }

    // Notifications
    if (pathname === '/api/notifications' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM notifications WHERE user_id = (SELECT user_id FROM users WHERE email = ?) ORDER BY created_at DESC').all(session.email);
      if (rows.length === 0) {
        const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
        const userId = userRow?.user_id;
        if (userId) {
          const insertNotif = db.prepare('INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, ?)');
          insertNotif.run(userId, 'Welcome!', 'Practice your daily Bisaya phrases!', 0);
          insertNotif.run(userId, 'Update', 'New community resources available!', 0);
          const fresh = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId);
          return send(res, 200, fresh);
        }
      }
      return send(res, 200, rows);
    }

    if (pathname.startsWith('/api/notifications/') && req.method === 'PUT') {
      const notifyId = pathname.split('/api/notifications/')[1];
      db.prepare('UPDATE notifications SET is_read = 1 WHERE notify_id = ? AND user_id = (SELECT user_id FROM users WHERE email = ?)').run(notifyId, session.email);
      return send(res, 200, { message: 'Notification marked as read' });
    }

    // Feedback
    if (pathname === '/api/feedback' && req.method === 'POST') {
      const { functionality, usability, reliability } = data || {};
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      db.prepare('INSERT INTO feedback (user_id, functionality, usability, reliability) VALUES (?, ?, ?, ?)').run(userId, functionality || 0, usability || 0, reliability || 0);
      return send(res, 200, { message: 'Feedback submitted successfully' });
    }

    // Learning modules
    if (pathname === '/api/learning/modules' && req.method === 'GET') {
      const rows = db.prepare('SELECT * FROM learning_modules ORDER BY module_id').all();
      return send(res, 200, rows);
    }

    if (pathname === '/api/learning/progress' && req.method === 'GET') {
      const rows = db.prepare('SELECT lp.*, lm.module_title, lm.difficulty FROM learning_progress lp JOIN learning_modules lm ON lp.module_id = lm.module_id WHERE lp.user_id = (SELECT user_id FROM users WHERE email = ?)').all(session.email);
      return send(res, 200, rows);
    }

    if (pathname === '/api/learning/progress' && req.method === 'POST') {
      const { module_id, completion_percent } = data || {};
      if (!module_id) return send(res, 400, { error: 'Module ID is required' });
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      const existing = db.prepare('SELECT progress_id FROM learning_progress WHERE user_id = ? AND module_id = ?').get(userId, module_id);
      if (existing) {
        db.prepare('UPDATE learning_progress SET completion_percent = ? WHERE progress_id = ?').run(completion_percent || 0, existing.progress_id);
      } else {
        db.prepare('INSERT INTO learning_progress (user_id, module_id, completion_percent) VALUES (?, ?, ?)').run(userId, module_id, completion_percent || 0);
      }
      return send(res, 200, { message: 'Progress updated successfully' });
    }

    // Community posts
    if (pathname === '/api/community/posts' && req.method === 'GET') {
      const rows = db.prepare('SELECT cp.*, u.fullname AS author_name FROM community_posts cp LEFT JOIN users u ON cp.user_id = u.user_id ORDER BY cp.created_at DESC').all();
      return send(res, 200, rows.map(r => ({ id: r.post_id, user_id: r.user_id, title: r.title, content: r.content, author: r.author_name, created_at: r.created_at })));
    }

    if (pathname === '/api/community/posts' && req.method === 'POST') {
      const { title, content } = data || {};
      if (!title || !content) return send(res, 400, { error: 'Title and content are required' });
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      const result = db.prepare('INSERT INTO community_posts (user_id, title, content) VALUES (?, ?, ?)').run(userId, title, content);
      return send(res, 200, { id: result.lastInsertRowid, title, content, created_at: new Date().toISOString() });
    }

    // Comments
    if (pathname.startsWith('/api/community/posts/') && pathname.endsWith('/comments') && req.method === 'GET') {
      const postId = pathname.split('/api/community/posts/')[1].split('/')[0];
      const rows = db.prepare('SELECT c.*, u.fullname AS author_name FROM comments c LEFT JOIN users u ON c.user_id = u.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC').all(postId);
      return send(res, 200, rows);
    }

    if (pathname.startsWith('/api/community/posts/') && pathname.endsWith('/comments') && req.method === 'POST') {
      const postId = pathname.split('/api/community/posts/')[1].split('/')[0];
      const { comment } = data || {};
      if (!comment) return send(res, 400, { error: 'Comment is required' });
      const userRow = db.prepare('SELECT user_id FROM users WHERE email = ?').get(session.email);
      const userId = userRow?.user_id;
      if (!userId) return send(res, 404, { error: 'User not found' });
      const result = db.prepare('INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)').run(postId, userId, comment);
      return send(res, 200, { comment_id: result.lastInsertRowid, post_id: parseInt(postId), user_id: userId, comment, created_at: new Date().toISOString() });
    }

    // AI Assistant chat
    if (pathname === '/api/assistant/chat' && req.method === 'POST') {
      const { message, language } = data || {};
      if (!message) return send(res, 400, { error: 'Message is required' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });
      const userRow = db.prepare('SELECT preferred_lang FROM users WHERE email = ?').get(session.email);
      const nativeLanguage = userRow?.preferred_lang || 'English';
      const systemPrompt = `You are "Hoy!", an enthusiastic and patient AI Bisaya (Cebuano) language tutor!

Your Mission:
- Help users learn and practice SPEAKING Bisaya (Cebuano)
- Make responses clear and easy to pronounce
- Focus on practical, everyday phrases

Teaching Style:
- Friendly, conversational, and encouraging
- Use emojis to make learning fun
- Keep explanations simple

Your Expertise:
- Teach Bisaya/Cebuano to ${nativeLanguage} speakers
- Show formal vs everyday Bisaya (slang & casual)
- Share cultural context and usage tips
- Write Bisaya phrases that are easy to speak aloud
- Give pronunciation guides in simple terms

What to Include in Responses:
- Bisaya phrases in quotation marks like "this"
- Example sentences with Bisaya first, then translation
- Keep sentences short and speakable
- Focus on common, useful phrases

Make sure all Bisaya phrases are easy to say out loud! Keep the tone warm and supportive.`;
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.9, max_tokens: 800 }),
      });
      if (!groqRes.ok) return send(res, 500, { error: 'AI request failed' });
      const groqData = await groqRes.json();
      return send(res, 200, { reply: groqData.choices[0].message.content });
    }

    // Legacy groq endpoint
    if (pathname === '/api/groq' && req.method === 'POST') {
      const { messages, nativeLanguage } = data || {};
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });
      if (!messages || !Array.isArray(messages) || messages.length === 0) return send(res, 400, { error: 'Messages must be a non-empty array' });
      const systemPrompt = `You are "Hoy!", an enthusiastic AI Bisaya language tutor. Your role:\n- Teach Bisaya (Cebuano) language to ${nativeLanguage} speakers\n- Compare formal Bisaya vs everyday Bisaya slang\n- Provide cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Include example sentences with translations\n- When explaining pronunciation, use simple phonetics\n- Keep responses under 200 words unless asked for more detail\n- If asked about topics outside language learning, gently redirect to Bisaya learning\n\nStart each response with a brief, warm acknowledgment of the user's question.`;
      const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text }))];
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.8, max_tokens: 600 }),
      });
      if (!groqRes.ok) return send(res, 500, { error: 'Groq API request failed' });
      const groqData = await groqRes.json();
      return send(res, 200, { content: groqData.choices[0].message.content });
    }

    // Tutor level
    if (pathname === '/api/tutor/level' && req.method === 'GET') {
      const row = db.prepare('SELECT level, strengths, weak_areas, common_mistakes, total_xp, total_sessions, last_active FROM learner_profiles WHERE user_id = (SELECT user_id FROM users WHERE email = ?)').get(session.email);
      if (!row) {
        db.prepare('INSERT INTO learner_profiles (user_id) VALUES ((SELECT user_id FROM users WHERE email = ?))').run(session.email);
        return send(res, 200, { level: 'beginner', strengths: [], weak_areas: [], common_mistakes: [], total_xp: 0, total_sessions: 0 });
      }
      return send(res, 200, row);
    }

    // Tutor mistakes
    if (pathname === '/api/tutor/mistakes' && req.method === 'GET') {
      const row = db.prepare('SELECT common_mistakes FROM learner_profiles WHERE user_id = (SELECT user_id FROM users WHERE email = ?)').get(session.email);
      if (!row) return send(res, 200, []);
      return send(res, 200, row.common_mistakes || []);
    }

    // Generate lesson
    if (pathname === '/api/tutor/lesson' && req.method === 'POST') {
      const { situation } = data || {};
      if (!situation) return send(res, 400, { error: 'Situation is required' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });
      const systemPrompt = 'You are a Bisaya (Cebuano) language lesson creator. Create a short interactive lesson for the given situation.\nReturn ONLY a valid JSON object (no other text) with this structure:\n{\n  "situation": "string",\n  "text": "short intro paragraph explaining what the user will learn",\n  "phrases": [\n    { "bisaya": "Bisaya phrase", "english": "English translation", "pronunciation": "phonetic guide" }\n  ],\n  "dialogue": [\n    { "speaker": "person role", "bisaya": "what they say", "english": "translation" }\n  ],\n  "cultural_note": "relevant cultural context",\n  "practice_suggestions": ["tip 1", "tip 2"]\n}';
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Create a lesson for: ' + situation }
      ];
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.7, max_tokens: 1200 }),
      });
      if (!groqRes.ok) return send(res, 500, { error: 'Lesson generation failed' });
      const groqData = await groqRes.json();
      try {
        const lesson = JSON.parse(groqData.choices[0].message.content);
        return send(res, 200, { role: 'lesson', ...lesson });
      } catch {
        return send(res, 200, { role: 'lesson', situation, text: groqData.choices[0].message.content, phrases: [], dialogue: [] });
      }
    }

    // Tutor chat
    if (pathname === '/api/tutor/chat' && req.method === 'POST') {
      const { message, audio, session_id } = data || {};
      if (!message && !audio) return send(res, 400, { error: 'Message or audio is required' });
      if (!GROQ_API_KEY) return send(res, 500, { error: 'Groq API key not configured' });

      let text = message || '';
      let transcription = null;
      let pronunciation = null;

      if (audio) {
        try {
          const audioBuffer = Buffer.from(audio, 'base64');
          const boundary = '----FormBoundary' + Date.now();
          const header = Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="recording.m4a"\r\nContent-Type: audio/mp4\r\n\r\n');
          const footer = Buffer.from('\r\n--' + boundary + '\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n--' + boundary + '--');
          const multipartBody = Buffer.concat([header, audioBuffer, footer]);
          const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY, 'Content-Type': 'multipart/form-data; boundary=' + boundary },
            body: multipartBody,
          });
          if (groqRes.ok) {
            const groqData = await groqRes.json();
            text = groqData.text || '';
            transcription = text;
          }
        } catch (err) {
          console.error('Transcription error:', err);
        }
      }

      if (!text) return send(res, 400, { error: 'Could not transcribe audio and no text provided' });

      const profileRow = db.prepare('SELECT * FROM learner_profiles WHERE user_id = (SELECT user_id FROM users WHERE email = ?)').get(session.email);
      let learnerLevel = 'beginner';
      let learnerStrengths = [];
      let learnerWeakAreas = [];
      let learnerMistakes = [];
      if (!profileRow) {
        db.prepare('INSERT INTO learner_profiles (user_id) VALUES ((SELECT user_id FROM users WHERE email = ?))').run(session.email);
      } else {
        learnerLevel = profileRow.level || 'beginner';
        try { learnerStrengths = typeof profileRow.strengths === 'string' ? JSON.parse(profileRow.strengths) : (profileRow.strengths || []); } catch { learnerStrengths = []; }
        try { learnerWeakAreas = typeof profileRow.weak_areas === 'string' ? JSON.parse(profileRow.weak_areas) : (profileRow.weak_areas || []); } catch { learnerWeakAreas = []; }
        try { learnerMistakes = typeof profileRow.common_mistakes === 'string' ? JSON.parse(profileRow.common_mistakes) : (profileRow.common_mistakes || []); } catch { learnerMistakes = []; }
      }

      let sessionMessages = [];
      let currentSessionId = session_id;
      if (session_id) {
        const sessionRow = db.prepare('SELECT messages FROM tutor_sessions WHERE session_id = ? AND user_id = (SELECT user_id FROM users WHERE email = ?)').get(session_id, session.email);
        if (sessionRow) {
          try { sessionMessages = typeof sessionRow.messages === 'string' ? JSON.parse(sessionRow.messages) : (sessionRow.messages || []); } catch { sessionMessages = []; }
        }
      }

      const levelInstructions = {
        beginner: '- Teach word-by-word with clear pronunciation\n- Use very simple sentences\n- Repeat key vocabulary 3 times\n- Always provide phonetic pronunciation guides\n- Praise effort heavily',
        intermediate: '- Expand to full sentences\n- Introduce common slang and casual forms\n- Correct grammar gently\n- Ask the user to repeat and practice\n- Introduce cultural context',
        advanced: '- Use natural speed conversation\n- Correct nuance and regional variations\n- Discuss cultural idioms and proverbs\n- Challenge with complex scenarios\n- Provide detailed feedback on word choice'
      };

      const mistakesContext = learnerMistakes.length > 0
        ? '\nTheir common mistakes:\n' + learnerMistakes.slice(0, 5).map(function(m) { return '- "' + m.pattern + '" should be "' + m.correction + '" (' + m.count + 'x errors)'; }).join('\n') + '\nProactively correct these when they appear.'
        : '';

      const weakAreaContext = learnerWeakAreas.length > 0
        ? '\nTheir weak areas: ' + learnerWeakAreas.slice(0, 3).join(', ') + '\nFocus extra attention on these topics.'
        : '';

      const systemPrompt = 'You are "Hoy!", an enthusiastic and patient AI Bisaya (Cebuano) language tutor!\n\nThis learner is at: ' + learnerLevel + ' level.\n' + mistakesContext + '\n' + weakAreaContext + '\n\nTeaching approach for their level:\n' + (levelInstructions[learnerLevel] || levelInstructions.beginner) + '\n\nYour Mission:\n- Help users learn and practice SPEAKING Bisaya (Cebuano)\n- Make responses clear and easy to pronounce\n- Focus on practical, everyday phrases\n\nTeaching Style:\n- Friendly, conversational, and encouraging\n- Use emojis to make learning fun\n- Keep explanations simple\n- Keep sentences short and speakable\n\nYour Expertise:\n- Teach Bisaya/Cebuano to English speakers\n- Show formal vs everyday Bisaya (slang & casual)\n- Share cultural context and usage tips\n- Write Bisaya phrases in quotation marks like "Maayong buntag"\n- Give pronunciation guides in simple terms\n- Always include English translations\n\nAfter your teaching reply, append a JSON analysis block on its own line like this:\n__ANALYSIS__{"detected_mistakes":[{"pattern":"wrong","correction":"right","count":1}],"topics":["topic1"],"user_level":"' + learnerLevel + '"}__END__';

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...sessionMessages,
        { role: 'user', content: text }
      ];

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages: apiMessages, temperature: 0.8, max_tokens: 1000 }),
      });

      if (!groqRes.ok) return send(res, 500, { error: 'AI tutor request failed' });

      const groqData = await groqRes.json();
      let reply = groqData.choices[0].message.content || '';

      let analysis = { detected_mistakes: [], topics: [], user_level: learnerLevel };
      const analysisMatch = reply.match(/__ANALYSIS__({.*?})__END__/);
      if (analysisMatch) {
        try {
          const parsed = JSON.parse(analysisMatch[1]);
          analysis = { ...analysis, ...parsed };
          reply = reply.replace(/__ANALYSIS__\{.*?\}__END__/, '').trim();
        } catch {}
      }

      if (audio && transcription) {
        try {
          const pronRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: GROQ_MODEL, messages: [
              { role: 'system', content: 'You are a Bisaya pronunciation coach. Analyze the given text. Return ONLY a valid JSON object with: "score" (0-100), "feedback" (string), "phoneme_breakdown" (array of {expected, heard, correct, tip}).' },
              { role: 'user', content: 'Analyze pronunciation for this Bisaya text: "' + transcription + '"' }
            ], temperature: 0.3, max_tokens: 500 }),
          });
          if (pronRes.ok) {
            const pronData = await pronRes.json();
            try {
              pronunciation = JSON.parse(pronData.choices[0].message.content);
            } catch {
              pronunciation = { score: 85, feedback: pronData.choices[0].message.content, phoneme_breakdown: [] };
            }
          }
        } catch {}
      }

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      if (profileRow) {
        const newMistakes = analysis.detected_mistakes || [];
        for (const nm of newMistakes) {
          const existing = learnerMistakes.find(function(m) { return m.pattern === nm.pattern; });
          if (existing) {
            existing.count = (existing.count || 1) + (nm.count || 1);
          } else {
            learnerMistakes.push({ pattern: nm.pattern, correction: nm.correction, count: nm.count || 1 });
          }
        }
        learnerMistakes.sort(function(a, b) { return (b.count || 0) - (a.count || 0); });
        const topMistakes = learnerMistakes.slice(0, 10);

        const topics = analysis.topics || [];
        for (const t of topics) {
          if (analysis.user_level === 'advanced' || !newMistakes || newMistakes.length === 0) {
            if (!learnerStrengths.includes(t)) learnerStrengths.push(t);
          } else {
            if (!learnerWeakAreas.includes(t)) learnerWeakAreas.push(t);
          }
        }
        const topStrengths = learnerStrengths.slice(-10);
        const topWeakAreas = learnerWeakAreas.slice(-10);

        db.prepare(
          'UPDATE learner_profiles SET level = ?, strengths = ?, weak_areas = ?, common_mistakes = ?, total_xp = total_xp + 10, total_sessions = total_sessions + CASE WHEN ? IS NULL THEN 0 ELSE 1 END, last_active = ? WHERE user_id = (SELECT user_id FROM users WHERE email = ?)'
        ).run(analysis.user_level || learnerLevel, JSON.stringify(topStrengths), JSON.stringify(topWeakAreas), JSON.stringify(topMistakes), session_id ? 0 : 1, now, session.email);
      }

      sessionMessages.push({ role: 'user', content: text });
      sessionMessages.push({ role: 'assistant', content: reply });

      if (currentSessionId) {
        db.prepare('UPDATE tutor_sessions SET messages = ?, ended_at = ? WHERE session_id = ?').run(JSON.stringify(sessionMessages), now, currentSessionId);
      } else {
        const sessionResult = db.prepare(
          'INSERT INTO tutor_sessions (user_id, messages, started_at, ended_at) VALUES ((SELECT user_id FROM users WHERE email = ?), ?, ?, ?)'
        ).run(session.email, JSON.stringify(sessionMessages), now, now);
        currentSessionId = String(sessionResult.lastInsertRowid);
      }

      return send(res, 200, {
        reply: reply,
        session_id: currentSessionId,
        transcription: transcription,
        pronunciation: pronunciation,
        analysis: analysis,
      });
    }

    send(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Server error:', error);
    send(res, 500, { error: 'Internal server error' });
  }
}

function start() {
  db = initSqlite();
  initDatabase();
  console.log('SQLite database connected');

  initMysql().then(pool => {
    mysql = pool;
    if (pool) {
      initMysqlSchema(pool).catch(err => console.warn('MySQL schema init warning:', err.message));
    }
  });

  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch(err => {
      console.error('Unhandled server error:', err);
      try { send(res, 500, { error: 'Internal server error' }); } catch {}
    });
  });
  server.listen(PORT, '0.0.0.0', () => { console.log(`Server running on http://localhost:${PORT}`); });
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

start();
