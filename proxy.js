/**
 * 平行宇宙推演器 - API中转代理
 * 解决前端直连DeepSeek暴露API Key的问题
 * 用法: node proxy.js
 */
const http = require('http');
const https = require('https');

const PORT = 8761;
const DEEPSEEK_API_KEY = 'sk-c2e51991ce014eaba95072ebb6a9c540';
const DEEPSEEK_HOST = 'api.deepseek.com';
const DEEPSEEK_PATH = '/chat/completions';

// CORS + JSON处理
const mimeJSON = 'application/json';

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 健康检查
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': mimeJSON });
    return res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
  }

  // 只接受 POST /chat
  if (req.method !== 'POST' || req.url !== '/chat') {
    res.writeHead(404, { 'Content-Type': mimeJSON });
    return res.end(JSON.stringify({ error: 'Not Found' }));
  }

  // 收集请求体
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);

      // 注入API Key和默认model（v2.5：默认启用deepseek-reasoner深度思考）
      if (!payload.model) payload.model = 'deepseek-reasoner';

      const postData = JSON.stringify(payload);
      const options = {
        hostname: DEEPSEEK_HOST,
        port: 443,
        path: DEEPSEEK_PATH,
        method: 'POST',
        headers: {
          'Content-Type': mimeJSON,
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => { data += chunk; });
        apiRes.on('end', () => {
          res.writeHead(apiRes.statusCode, { 'Content-Type': mimeJSON });
          res.end(data);
        });
      });

      apiReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.writeHead(502, { 'Content-Type': mimeJSON });
        res.end(JSON.stringify({ error: 'Upstream API error', detail: err.message }));
      });

      apiReq.write(postData);
      apiReq.end();

    } catch (err) {
      res.writeHead(400, { 'Content-Type': mimeJSON });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Proxy] API中转代理已启动: http://localhost:${PORT}`);
  console.log(`[Proxy] 健康检查: http://localhost:${PORT}/health`);
  console.log(`[Proxy] DeepSeek转发: POST http://localhost:${PORT}/chat`);
});
