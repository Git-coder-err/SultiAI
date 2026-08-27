import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345';

function b64url(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

const header = b64url({ alg: 'HS256', typ: 'JWT' });
const now = Date.now();
const payload = b64url({
  email: 'test@sulti.ai',
  userId: 1,
  iat: now,
  exp: now + 15 * 60 * 1000,
  type: 'access',
});
const sig = crypto
  .createHmac('sha256', JWT_SECRET)
  .update(`${header}.${payload}`)
  .digest('base64url');

const token = `${header}.${payload}.${sig}`;

// Read test WAV generated earlier
const wavPath = path.join(__dirname, '..', '..', 'ai-service', 'test_audio.wav');
console.log('WAV path:', wavPath, '| exists:', fs.existsSync(wavPath));
const audioB64 = fs.existsSync(wavPath)
  ? fs.readFileSync(wavPath).toString('base64')
  : '';

async function main() {
  // Step 1: verify Python service reachable via Node's isPythonServiceAvailable logic
  const health = await fetch('http://localhost:8000/health');
  console.log('Python /health:', await health.json());

  // Step 2: call Node pronunciation/check with audio (should hit Python path)
  const res = await fetch('http://localhost:3001/api/speech/pronunciation/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      audio: audioB64,
      expected_text: 'Kumusta',
      language: 'ceb',
    }),
  });

  console.log('Node status:', res.status);
  const contentType = res.headers.get('content-type');
  console.log('Content-Type:', contentType);
  const raw = await res.text();
  console.log('Raw response:', raw.slice(0, 1500));
  let data: any = {};
  try { data = JSON.parse(raw); } catch {}

  // Detect which path was used
  if (data?.metrics) {
    console.log('\n>>> USED PYTHON ACOUSTIC ANALYSIS (metrics present)');
  } else {
    console.log('\n>>> Used LLM fallback (no metrics)');
  }
}

main().catch((e) => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
