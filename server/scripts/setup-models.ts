#!/usr/bin/env node
/**
 * Setup script for SultiAI local models
 * 
 * Downloads quantized LLM and STT models for offline operation.
 * No API keys required.
 * 
 * Usage:
 *   node scripts/setup-models.js [options]
 * 
 * Options:
 *   --llm     Download LLM model only (TinyLlama 1.1B)
 *   --stt     Download STT model only (Whisper Tiny)
 *   --all     Download both (default)
 */

import { pipeline } from '@xenova/transformers';
import path from 'path';
import fs from 'fs';

const MODELS_DIR = path.join(process.cwd(), 'models');
const MODELS = {
  LLM: 'Xenova/TinyLlama-1.1B-Chat-v1.0',
  STT: 'Xenova/whisper-tiny.en',
  LLM_LARGE: 'Xenova/llama-2-7b-chat-q4f16-awq',
};

async function downloadLLM() {
  console.log(`[Setup] Downloading local LLM: ${MODELS.LLM}`);
  console.log('[Setup] This is a ~600MB quantized model. First run may take a few minutes...');

  await pipeline('text-generation', MODELS.LLM, {
    quantized: true,
    cache_dir: MODELS_DIR,
  });

  console.log('[Setup] LLM model downloaded successfully!');
}

async function downloadSTT() {
  console.log(`[Setup] Downloading local STT: ${MODELS.STT}`);
  console.log('[Setup] This is a ~300MB quantized model...');

  await pipeline('automatic-speech-recognition', MODELS.STT, {
    quantized: true,
    cache_dir: MODELS_DIR,
  });

  console.log('[Setup] STT model downloaded successfully!');
}

async function main() {
  const args = process.argv.slice(2);
  const downloadAll = args.length === 0 || args.includes('--all');
  const downloadLLM = downloadAll || args.includes('--llm');
  const downloadSTT = downloadAll || args.includes('--stt');

  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  console.log('[Setup] SultiAI Local Models Setup');
  console.log('===================================');
  console.log(`Models directory: ${MODELS_DIR}`);
  console.log(`No API keys required - all processing is local and offline.`);
  console.log('');

  try {
    if (downloadLLM) {
      await downloadLLM();
      console.log('');
    }

    if (downloadSTT) {
      await downloadSTT();
      console.log('');
    }

    console.log('[Setup] All models ready!');
    console.log('[Setup] Run "npm run dev" in the server directory to start SultiAI.');
    console.log('');
    console.log('[Setup] Optional: For better quality, you can download the larger 7B model:');
    console.log(`        Set LOCAL_LLM_MODEL=${MODELS.LLM_LARGE} in server/.env`);
  } catch (err) {
    console.error('[Setup] Failed to download models:', err);
    process.exit(1);
  }
}

main();
