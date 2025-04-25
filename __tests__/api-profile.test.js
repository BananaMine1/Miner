const request = require('supertest');
const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// These should be set to valid test values or mocked
const TEST_JWT = 'test-jwt';
const CSRF_TOKEN = process.env.NEXT_PUBLIC_CSRF_TOKEN || 'banana-csrf-demo-token';

describe('/api/profile endpoint', () => {
  let server;
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => handle(req, res)).listen(4001);
  });
  afterAll(() => {
    server.close();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(server)
      .post('/api/profile')
      .send({ username: 'TestUser', bio: 'bio', avatar_url: null })
      .set('x-csrf-token', CSRF_TOKEN);
    expect(res.status).toBe(401);
  });

  it('rejects requests without CSRF token', async () => {
    const res = await request(server)
      .post('/api/profile')
      .set('Authorization', `Bearer ${TEST_JWT}`)
      .send({ username: 'TestUser', bio: 'bio', avatar_url: null });
    expect(res.status).toBe(403);
  });

  it('rejects invalid input', async () => {
    const res = await request(server)
      .post('/api/profile')
      .set('Authorization', `Bearer ${TEST_JWT}`)
      .set('x-csrf-token', CSRF_TOKEN)
      .send({ username: 'x', bio: 'a'.repeat(201), avatar_url: 123 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Username must be 2-32 characters/);
    expect(res.body.error).toMatch(/Bio must be a string up to 200 characters/);
    expect(res.body.error).toMatch(/Avatar URL must be a string or null/);
  });

  // You can add a successful update test with a valid JWT and a test Supabase instance
}); 