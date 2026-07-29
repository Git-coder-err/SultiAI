import { defineConfig } from 'drizzle-kit';
import * as path from 'path';
import * as fs from 'fs';

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          let v = trimmed.slice(eqIdx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
            v = v.slice(1, -1);
          if (!process.env[k]) process.env[k] = v;
        }
      }
    }
  } catch {}
}

loadEnv();

const dialect = process.env.DB_DIALECT || 'sqlite';

function getDbCredentials() {
  if (dialect === 'sqlite') {
    return { url: process.env.DB_PATH || path.join(__dirname, 'sultiai.db') };
  }
  if (dialect === 'postgresql') {
    return { url: process.env.DATABASE_URL || 'postgres://localhost:5432/sultiai' };
  }
  return { url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/sultiai' };
}

export default defineConfig({
  schema: `./src/db/schema-${dialect === 'postgresql' ? 'pg' : dialect === 'mysql' ? 'mysql' : 'sqlite'}.ts`,
  out: `./drizzle/${dialect}`,
  dialect: dialect as 'sqlite' | 'postgresql' | 'mysql',
  dbCredentials: getDbCredentials(),
});
