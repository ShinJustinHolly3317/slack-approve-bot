# 🚀 Deployment Guide

This guide covers multiple ways to deploy your GitHub Approve Slack app.

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ Slack app configured with tokens
- ✅ GitHub personal access token
- ✅ App tested locally

## 🌐 Deployment Options

### 1. 🟢 Heroku (Recommended for Beginners)

**Pros:** Easy, free tier available, automatic scaling
**Cons:** Cold starts, limited free hours

#### Steps:
1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and create app:**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set SLACK_BOT_TOKEN=xoxb-your-token
   heroku config:set SLACK_SIGNING_SECRET=your-secret
   heroku config:set SLACK_APP_TOKEN=xapp-your-token
   heroku config:set GITHUB_TOKEN=ghp_your-token
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Check logs:**
   ```bash
   heroku logs --tail
   ```

#### One-Click Deploy:
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

---

### 2. 🚂 Railway (Modern & Fast)

**Pros:** Fast, modern, generous free tier, great DX
**Cons:** Newer platform

#### Steps:
1. **Connect GitHub:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Import this repository

2. **Set environment variables:**
   - In Railway dashboard, go to Variables
   - Add all your tokens

3. **Deploy:**
   - Railway auto-deploys on git push
   - Your app will be live at `https://your-app.railway.app`

---

### 3. 🐳 Docker (Any Cloud Provider)

**Pros:** Consistent environment, works anywhere
**Cons:** Requires Docker knowledge

#### Local Docker:
```bash
# Build image
docker build -t github-approve-slack .

# Run container
docker run -d \
  --name github-approve-slack \
  -p 3000:3000 \
  -e SLACK_BOT_TOKEN=xoxb-your-token \
  -e SLACK_SIGNING_SECRET=your-secret \
  -e SLACK_APP_TOKEN=xapp-your-token \
  -e GITHUB_TOKEN=ghp_your-token \
  github-approve-slack
```

#### Docker Compose:
```bash
# Create .env file with your tokens
cp env.example .env

# Start with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### Deploy to Cloud:
- **Google Cloud Run:** `gcloud run deploy`
- **AWS ECS:** Use the Dockerfile
- **Azure Container Instances:** `az container create`

---

### 4. ☁️ Vercel (Serverless)

**Pros:** Serverless, fast, free tier
**Cons:** May have cold starts

#### Steps:
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables:**
   ```bash
   vercel env add SLACK_BOT_TOKEN
   vercel env add SLACK_SIGNING_SECRET
   vercel env add SLACK_APP_TOKEN
   vercel env add GITHUB_TOKEN
   ```

---

### 5. 🖥️ VPS/Server (PM2)

**Pros:** Full control, cost-effective for high usage
**Cons:** Requires server management

#### Steps:
1. **Setup server:**
   ```bash
   # Install Node.js and PM2
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```

2. **Clone and setup:**
   ```bash
   git clone https://github.com/your-username/github-approve-slack.git
   cd github-approve-slack
   npm install --production
   ```

3. **Create .env file:**
   ```bash
   cp env.example .env
   # Edit .env with your tokens
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

5. **Setup reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔧 Environment Variables

Make sure to set these in your deployment platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token | `xoxb-240734075399-...` |
| `SLACK_SIGNING_SECRET` | App Signing Secret | `d448b5b1f16e3764...` |
| `SLACK_APP_TOKEN` | App-Level Token | `xapp-1-A091ZFR1QAC-...` |
| `GITHUB_TOKEN` | Personal Access Token | `ghp_HG0Ed1jzXlJl...` |
| `PORT` | Server port (optional) | `3000` |
| `NODE_ENV` | Environment | `production` |

---

## 🔍 Monitoring & Logs

### Health Check Endpoint
Your app automatically includes health monitoring. Most platforms will ping your app to keep it alive.

### Logging
- **Heroku:** `heroku logs --tail`
- **Railway:** Built-in logs in dashboard
- **Docker:** `docker logs container-name`
- **PM2:** `pm2 logs`

### Monitoring Services
Consider adding:
- **Uptime monitoring:** UptimeRobot, Pingdom
- **Error tracking:** Sentry
- **Performance:** New Relic, DataDog

---

## 🚨 Troubleshooting

### Common Issues:

1. **App not responding to PR links:**
   - Check Slack app event subscriptions
   - Verify bot is in the channel
   - Check logs for errors

2. **GitHub API errors:**
   - Verify GitHub token has correct permissions
   - Check if token is expired
   - Ensure repository access

3. **Slack API errors:**
   - Verify all Slack tokens are correct
   - Check app permissions/scopes
   - Ensure Socket Mode is enabled

4. **Memory issues:**
   - Increase memory limits in your platform
   - Consider using PM2 cluster mode
   - Monitor memory usage

### Debug Mode:
Set `NODE_ENV=development` for detailed logging.

---

## 🔄 Updates & Maintenance

### Updating the App:
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart (platform-specific)
heroku restart              # Heroku
pm2 restart all            # PM2
docker-compose restart     # Docker
```

### Backup Strategy:
- Environment variables are backed up in your deployment platform
- Source code is in Git
- No database to backup (stateless app)

---

## 📊 Scaling

### Traffic Expectations:
- **Light usage (< 100 PRs/day):** Any free tier works
- **Medium usage (100-1000 PRs/day):** Paid Heroku/Railway
- **Heavy usage (> 1000 PRs/day):** VPS or cloud containers

### Scaling Options:
1. **Vertical:** Increase memory/CPU
2. **Horizontal:** Multiple instances (requires load balancer)
3. **Caching:** Add Redis for GitHub API responses

---

## 🎯 Recommended Deployment Path

For most users, I recommend this progression:

1. **Start:** Heroku free tier (easy setup)
2. **Growth:** Railway or Heroku paid (better performance)
3. **Scale:** VPS with PM2 (cost-effective)
4. **Enterprise:** Kubernetes cluster (full control)

Choose based on your team size, technical expertise, and budget!

---

## 🆘 Need Help?

- Check the main README.md for setup issues
- Look at GitHub Issues for common problems
- The app logs will show detailed error messages
- Test locally first before deploying 