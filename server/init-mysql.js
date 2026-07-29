async function initMysqlSchema(mysql) {
  const schema = `
    CREATE TABLE IF NOT EXISTS avatars (
      avatar_id INT AUTO_INCREMENT PRIMARY KEY,
      avatar_name VARCHAR(255) NOT NULL,
      avatar_image TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      fullname VARCHAR(255) NOT NULL,
      username VARCHAR(255),
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_id INT DEFAULT 1,
      preferred_lang VARCHAR(50) DEFAULT 'English',
      learning_lang VARCHAR(50) DEFAULT 'Bisaya',
      country VARCHAR(100),
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (avatar_id) REFERENCES avatars(avatar_id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS user_settings (
      setting_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      dark_mode TINYINT(1) DEFAULT 0,
      speech_speed DECIMAL(3,1) DEFAULT 1.0,
      voice_gender VARCHAR(20) DEFAULT 'neutral',
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS saved_phrases (
      phrase_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      phrase TEXT NOT NULL,
      language VARCHAR(50),
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS notifications (
      notify_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255),
      message TEXT,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS feedback (
      feedback_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      functionality INT DEFAULT 0,
      usability INT DEFAULT 0,
      reliability INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS conversations (
      conversation_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS conversation_messages (
      message_id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id INT NOT NULL,
      sender VARCHAR(50) NOT NULL DEFAULT 'user',
      message TEXT,
      translated_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS speech_records (
      speech_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      audio_path TEXT,
      recognized_text TEXT,
      language_detected VARCHAR(50),
      confidence DECIMAL(4,3) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS translations (
      translation_id INT AUTO_INCREMENT PRIMARY KEY,
      speech_id INT NOT NULL,
      source_language VARCHAR(50),
      target_language VARCHAR(50),
      translated_text TEXT,
      FOREIGN KEY (speech_id) REFERENCES speech_records(speech_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS phrase_recommendations (
      recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
      speech_id INT NOT NULL,
      recommended_phrase TEXT,
      intent VARCHAR(100),
      confidence DECIMAL(4,3) DEFAULT 0,
      FOREIGN KEY (speech_id) REFERENCES speech_records(speech_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS learning_modules (
      module_id INT AUTO_INCREMENT PRIMARY KEY,
      module_title VARCHAR(255) NOT NULL,
      difficulty VARCHAR(50) DEFAULT 'beginner',
      language VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS learning_progress (
      progress_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      module_id INT NOT NULL,
      completion_percent DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES learning_modules(module_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS community_posts (
      post_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255),
      content TEXT,
      phrase TEXT,
      translation TEXT,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS comments (
      comment_id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS learner_profiles (
      profile_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      level VARCHAR(50) DEFAULT 'beginner',
      strengths JSON,
      weak_areas JSON,
      common_mistakes JSON,
      total_xp INT DEFAULT 0,
      total_sessions INT DEFAULT 0,
      last_active TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS tutor_sessions (
      session_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      messages JSON,
      summary TEXT,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const statements = schema.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      try {
        await mysql.execute(stmt);
      } catch (err) {
        console.warn('MySQL schema warning:', err.message);
      }
    }
  }

  const [rows] = await mysql.execute('SELECT 1 FROM avatars WHERE avatar_id = 1');
  if (rows.length === 0) {
    await mysql.execute(
      'INSERT INTO avatars (avatar_id, avatar_name, avatar_image) VALUES (1, ?, ?)',
      ['Default', 'https://api.dicebear.com/7.x/avataaars/svg?seed=default']
    );
  }

  console.log('MySQL schema initialized');
}

module.exports = { initMysqlSchema };
