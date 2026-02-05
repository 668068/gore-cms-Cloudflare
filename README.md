# gore-cms-Cloudflare
完全运行在 Cloudflare 生态系统中的博客平台，（前端存储在 R2、后端运行在 Workers、可视化后台管理)

一、架构设计
前端
存储: 使用 Cloudflare R2 存储静态资源（HTML, CSS, JS, Images）
展示: 使用 Cloudflare Pages 展示静态内容
编辑: 后台通过 Workers API 实现在线编辑功能，直接操作 R2 中的文件
后端
API: 使用 Cloudflare Workers 提供 RESTful API，支持文章管理、分类管理、友情链接管理等功能
认证: /admin/login 实现管理员登录，使用简单的 token 认证机制
数据库: 使用 D1 存储结构化数据（如文章元信息、分类、友情链接等）
功能模块
首页
展示最新文章列表
友情链接
关于我们、免责声明、Cookie 政策底部栏
左下角 Cookie 弹窗
分类页
按分类筛选文章
文章页
显示文章详情
后台管理
文章管理：编辑、发布、删除
分类管理：添加、编辑、删除
友情链接管理
数据库备份与导入
R2 文件管理：上传、下载、删除、编辑
二、具体实现步骤
1. 初始化项目
首先，在本地初始化项目目录：
mkdir cloudflare-blog
cd cloudflare-blog
2. 创建 Workers 项目
使用 Wrangler CLI 创建一个新的 Worker 项目：
npm create cloudflare@latest blog-api --type worker-typescript
cd blog-api
安装依赖：
npm install @cloudflare/workers-types marked axios
3. Workers 代码示例
src/index.ts
typescript

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
4. 配置 wrangler.toml
toml


name = "blog-api"
main = "src/index.ts"
compatibility_date = "2024-06-01"

[[d1_databases]]
binding = "DB"
database_name = "blog-db"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "blog-bucket"

[vars]
ADMIN_PASSWORD = "your-admin-password"
5. 创建 Cloudflare Pages 项目
在 Cloudflare Dashboard 中创建一个新的 Pages 项目，并将前端代码部署到 Pages。
示例 index.html
html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Blog</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <h1>My Blog</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/categories">Categories</a>
      <a href="/about">About Us</a>
      <a href="/disclaimer">Disclaimer</a>
      <a href="/privacy">Privacy Policy</a>
    </nav>
  </header>

  <main>
    <!-- Content will be dynamically inserted here -->
  </main>

  <footer>
    <p>&copy; 2024 My Blog</p>
  </footer>

  <script src="/app.js"></script>
</body>
</html>
示例 app.js
javascript

async function loadPosts() {
  const response = await fetch('/api');
  const posts = await response.json();
  const main = document.querySelector('main');
  posts.forEach(post => {
    const article = document.createElement('article');
    article.innerHTML = `<h2>${post.title}</h2><p>${post.content}</p>`;
    main.appendChild(article);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
});
6. 后台管理界面
为了简化开发流程，可以考虑使用现有的开源 CMS 系统或框架进行二次开发，例如 TinaCMS 或者 Netlify CMS，它们提供了可视化的后台管理系统，能够直接与 GitHub/GitLab 等 Git 平台集成。
但是，如果你希望完全自定义并集成到 Cloudflare 生态中，则需要自行编写管理页面的前端逻辑，利用 Workers API 进行数据交互。
三、关键点总结
R2 文件管理: 通过 Workers API 实现对 R2 中文件的增删改查操作。
D1 数据库管理: 利用 D1 存储文章元信息、分类等结构化数据。
前端静态资源托管: 将 HTML/CSS/JS 文件存放在 R2 中，减少 Pages 的配额消耗。
Cookie 弹窗: 使用 JavaScript 实现 Cookie 弹窗功能，提示用户接受或拒绝 Cookie。
四、后续第二个版本尝试优化
安全性增强: 对 API 请求进行身份验证和授权控制。
性能优化: 使用缓存策略提高页面加载速度。
用户体验提升: 设计更加友好的 UI/UX，确保网站既简洁又美观。
