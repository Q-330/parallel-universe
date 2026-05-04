# 🚀 Railway 部署指南

## 准备工作
1. **Railway账号**：访问 https://railway.app 注册（支持GitHub登录）
2. **DeepSeek API Key**：确保你有有效的API Key

---

## 方法一：从GitHub部署（推荐）

### 第1步：推送代码到GitHub
```bash
cd C:\Users\54853\WorkBuddy\2026-05-03-task-4\parallel-universe
git init
git add .
git commit -m "Initial commit: 平行宇宙推演器"
git branch -M main

# 在GitHub创建名为 parallel-universe 的仓库后：
git remote add origin https://github.com/你的用户名/parallel-universe.git
git push -u origin main
```

### 第2步：Railway部署
1. 登录 https://railway.app
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择刚才推送的 `parallel-universe` 仓库
5. Railway会自动识别 `railway.json` 并开始部署

### 第3步：设置环境变量
1. 在Railway项目页面，点击 **"Variables"** 标签
2. 添加变量：
   - Key: `DEEPSEEK_API_KEY`
   - Value: `你的DeepSeek API Key`
3. 点击 **"Add"** 保存
4. Railway会自动重新部署

### 第4步：获取访问地址
1. 部署完成后，点击 **"Settings"** 标签
2. 在 **"Domains"** 部分，点击 **"Generate Domain"**
3. Railway会生成一个 `.up.railway.app` 的域名
4. 用这个域名就可以分享给其他人了！

---

## 方法二：使用Railway CLI本地部署

### 第1步：安装Railway CLI
```bash
npm install -g @railway/cli
```

### 第2步：登录Railway
```bash
railway login
```
浏览器会自动打开登录页面，登录后会自动关联CLI

### 第3步：初始化项目
```bash
cd C:\Users\54853\WorkBuddy\2026-05-03-task-4\parallel-universe
railway init
```
会提示你创建新项目或关联到现有项目

### 第4步：设置环境变量
```bash
railway variables set DEEPEEK_API_KEY=你的API_Key
```

### 第5步：部署
```bash
railway up
```
CLI会上传代码并触发部署

### 第6步：获取域名
```bash
railway domain
```

---

## 常见问题

### Q: 部署后访问显示502错误？
**A**: 检查环境变量 `DEEPSEEK_API_KEY` 是否正确设置，可以在Railway的"Deployments"标签查看日志

### Q: 如何更新网站？
**A**: 
- 方法一：重新推送代码到GitHub，Railway会自动重新部署
- 方法二：修改代码后运行 `railway up` 重新部署

### Q: 免费额度够用吗？
**A**: Railway提供5美元免费额度/月，对于个人项目完全够用。流量和请求都在免费额度内。

---

## 部署成功标志
- ✅ Railway项目状态显示 **"Active"**
- ✅ 访问你的 `.up.railway.app` 域名能看到网站
- ✅ 打开网站后能正常进行AI对话

---

## 下一步
部署成功后，你就可以把网址分享给朋友了！
建议再配置一个自定义域名（在Railway的"Domains"设置中）。
