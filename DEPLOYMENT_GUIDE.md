# 🚀 Deployment Guide - Future Jaano

यह guide आपके Future Jaano project को deploy करने में मदद करेगा।

## 📋 Prerequisites

- GitHub Account
- Railway.app Account (API Server के लिए)
- Vercel Account (Frontend के लिए)
- Node.js 20+
- pnpm

---

## 🔧 Setup Instructions

### Step 1: Railway Token Setup (API Server)

1. Railway.app पर जाएँ: https://railway.app
2. Dashboard में जाएँ
3. Settings → API Token
4. Token copy करें
5. GitHub Repository → Settings → Secrets and variables → Actions
6. नया secret बनाएँ: `RAILWAY_TOKEN` = [आपका token]

### Step 2: Vercel Token Setup (Frontend)

1. Vercel पर जाएँ: https://vercel.com
2. Settings → Tokens
3. नया token बनाएँ
4. GitHub Repository → Settings → Secrets
5. तीन secrets add करें:
   - `VERCEL_TOKEN` = [आपका Vercel token]
   - `VERCEL_ORG_ID` = [आपका org ID]
   - `VERCEL_PROJECT_ID` = [आपका project ID]

---

## 📦 Project Structure

```
future-jaano/
├── artifacts/
│   ├── api-server/          # Express API Server
│   │   ├── src/
│   │   ├── dist/
│   │   ├── build.mjs
│   │   └── package.json
│   └── frontend/            # React/Next.js Frontend
├── scripts/                 # Utility scripts
├── .github/
│   └── workflows/           # GitHub Actions
│       ├── deploy-api-server.yml
│       ├── deploy-frontend.yml
│       └── build-and-test.yml
└── package.json

```

---

## 🚀 Deployment Workflows

### 1. Build & Test Workflow
**Trigger:** Push to `main` or `develop` branch, or PR

```bash
✅ Type checking
✅ Build
```

### 2. API Server Deployment (Railway)
**Trigger:** Push to `main` (artifacts/api-server/* changes)

```bash
✅ Install dependencies
✅ Build API
✅ Deploy to Railway
```

### 3. Frontend Deployment (Vercel)
**Trigger:** Push to `main` (artifacts/frontend/* changes)

```bash
✅ Install dependencies
✅ Build frontend
✅ Deploy to Vercel
```

---

## 🔑 Environment Variables

### API Server (.env)

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=your_database_url

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable

# OpenAI
OPENAI_API_KEY=your_openai_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Web Push
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_PUBLIC_KEY=your_vapid_public_key
```

### Frontend (.env)

```env
VITE_API_URL=https://your-api-server.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

---

## ✅ Manual Deployment

### Deploy API Server Manually

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Start API Server
cd artifacts/api-server
pnpm run start
```

### Deploy Frontend Manually

```bash
# Install dependencies
pnpm install

# Build
cd artifacts/frontend
pnpm run build

# Deploy to Vercel
vercel deploy --prod
```

---

## 📊 Monitoring

- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Actions:** Repository → Actions tab

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Deployment Token Issues
- Ensure secrets are correctly set in GitHub
- Check token expiry on Railway/Vercel
- Regenerate and update secrets if needed

### Environment Variable Missing
- Check `.env` file exists in deployment environment
- Verify all required variables are set
- Check variable names are correct (case-sensitive)

---

## 📞 Support

For issues:
1. Check GitHub Actions logs
2. Review deployment platform dashboard
3. Check environment variables
4. Verify dependencies are installed

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io)

---

**Last Updated:** 2026-06-15
**Project:** Future Jaano - Astro Solutions Hub
