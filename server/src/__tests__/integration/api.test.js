const request = require('supertest');
const express = require('express');

describe('API Response Format', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.get('/api/health', (_req, res) => {
      res.json({
        success: true,
        data: { status: 'ok' },
        meta: { timestamp: new Date().toISOString(), requestId: 'test-123' },
      });
    });

    app.get('/api/error', (_req, res) => {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
        },
        meta: { timestamp: new Date().toISOString(), requestId: 'test-456' },
      });
    });

    app.get('/api/not-found', (_req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
        meta: { timestamp: new Date().toISOString(), requestId: 'test-789' },
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return standardized success response', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.timestamp).toBeDefined();
      expect(res.body.meta.requestId).toBeDefined();
    });
  });

  describe('GET /api/error', () => {
    it('should return standardized error response', async () => {
      const res = await request(app).get('/api/error');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toBe('Invalid input');
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /api/not-found', () => {
    it('should return 404 with proper error code', async () => {
      const res = await request(app).get('/api/not-found');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});

describe('Rate Limiting', () => {
  it('should include rate limit headers', async () => {
    const app = express();
    app.use(express.json());
    app.set('trust proxy', 1);

    const requests = [];
    const windowMs = 60000;
    const max = 5;

    app.use((req, res, next) => {
      const now = Date.now();
      requests.push(now);
      const recent = requests.filter((t) => now - t < windowMs);
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - recent.length)));
      next();
    });

    app.get('/test', (_req, res) => res.json({ ok: true }));

    const res = await request(app).get('/test');
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
  });
});
