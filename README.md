# 平行宇宙推演器 - 部署指南

## 最快部署方式（推荐）：Railway

**免费额度**：每月 $5 免费额度，够个人使用

### 步骤：
1. 打开 https://railway.app ，用 GitHub 登录
2. 点 **New Project** → **Deploy from GitHub repo**
3. 把代码推到 GitHub 仓库（只需 `index.html` + `server.js` + `package.json`）
4. Railway 自动识别 Node.js 项目并部署
5. 部署完成后会给你一个网址，直接分享给任何人

### 设置 API Key（重要）：
1. Railway 项目页面 → **Variables**
2. 添加：`DEEPSEEK_API_KEY` = `你的DeepSeek API Key`
3. 项目会自动重新部署

---

## 备选方案：Render

**免费额度**：免费套餐可用（750小时/月）

### 步骤：
1. 打开 https://render.com ，用 GitHub 登录
2. 点 **New** → **Web Service**
3. 连接你的 GitHub 仓库
4. 配置：
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Environment 添加 `DEEPSEEK_API_KEY`
6. 点 **Create Web Service**，等部署完成

---

## 备选方案：Vercel

### 步骤：
1. 打开 https://vercel.com ，用 GitHub 登录
2. 点 **Add New** → **Project** → 导入 GitHub 仓库
3. Framework Preset 选 **Other**
4. Environment Variables 添加 `DEEPSEEK_API_KEY`
5. 点 **Deploy**

---

## 本地测试

```bash
cd parallel-universe
node server.js
# 浏览器打开 http://localhost:8761
```

---

## 文件说明

| 文件 | 作用 |
|------|------|
| index.html | 前端页面（平行宇宙推演器） |
| server.js | 后端服务（静态文件 + API代理） |
| package.json | 项目配置 |
| vercel.json | Vercel部署配置 |
