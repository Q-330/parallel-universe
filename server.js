/**
 * 平行宇宙推演器 - 一体化部署服务
 * 同时提供：静态页面服务 + API代理转发
 *
 * 用法:
 *   node server.js
 *   打开 http://localhost:8761 即可使用
 *
 * 部署:
 *   丢到任意支持Node.js的云平台（Vercel / Railway / Render / 腾讯云等）即可
 *   环境变量 DEEPSEEK_API_KEY 设置你的API Key
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8761;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;  // 只从环境变量读取，部署时必须设置
const DEEPSEEK_HOST = 'api.deepseek.com';
const DEEPSEEK_PATH = '/chat/completions';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API: 健康检查
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
  }

  // API: AI代理转发
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.model) payload.model = 'deepseek-reasoner';

        const postData = JSON.stringify(payload);
        const options = {
          hostname: DEEPSEEK_HOST,
          port: 443,
          path: DEEPSEEK_PATH,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const apiReq = https.request(options, (apiRes) => {
          let data = '';
          apiRes.on('data', chunk => { data += chunk; });
          apiRes.on('end', () => {
            res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(data);
          });
        });

        apiReq.on('error', (err) => {
          console.error('Proxy error:', err.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Upstream API error', detail: err.message }));
        });

        apiReq.write(postData);
        apiReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // 静态文件服务
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  // 安全检查：防止路径穿越
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  平行宇宙推演器 已启动');
  console.log('  本地访问: http://localhost:' + PORT);
  console.log('  API代理:  POST http://localhost:' + PORT + '/chat');
  console.log('  健康检查: GET  http://localhost:' + PORT + '/health');
  console.log('');
});
