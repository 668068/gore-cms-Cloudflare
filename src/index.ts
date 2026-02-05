import { Router } from 'itty-router';
import { marked } from 'marked';
import { D1Database } from '@cloudflare/workers-types';

const router = Router();

interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
}

router.get('/', async (req, env) => {
  const posts = await env.DB.prepare('SELECT * FROM posts ORDER BY date DESC LIMIT 10').all();
  return new Response(JSON.stringify(posts.results), { headers: { 'Content-Type': 'application/json' } });
});

router.post('/login', async (req, env) => {
  const body = await req.json();
  if (body.password === env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ token: 'your-token' }), { headers: { 'Content-Type': 'application/json' } });
  }
  return new Response('Unauthorized', { status: 401 });
});

// 更多路由...

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    return router.handle(req, env);
  },
};
