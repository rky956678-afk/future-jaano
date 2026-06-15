# 🚀 Deploy Future Jaano - Quick Start Guide

## 📋 Prerequisites

✅ GitHub Account
✅ Railway Account (https://railway.app)
✅ Vercel Account (https://vercel.com)
✅ Node.js 20+
✅ pnpm installed

---

## ⚡ 5-Minute Setup

### Step 1: Clone & Setup Repository

```bash
git clone https://github.com/rky956678-afk/future-jaano
cd future-jaano
pnpm install
```

### Step 2: Add GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these 4 secrets:

| Secret Name | Where to get |
|-------------|-------------|
| `RAILWAY_TOKEN` | Railway.app → Account → API Token |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel → Dashboard → Settings |
| `VERCEL_PROJECT_ID` | Vercel → Project → Settings |

### Step 3: Configure Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link

# Set up environment variables
railway variables
```

### Step 4: Configure Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Set production environment
vercel env add VITE_API_URL production
```

### Step 5: Push & Deploy

```bash
git checkout add-deployment-workflow
git push origin add-deployment-workflow
```

**Then create Pull Request on GitHub → Merge to main**

---

## 📁 What Gets Deployed

### API Server (Railway)
- **Port:** 3000 (configurable)
- **Services:** Express.js backend
- **Database:** Connected via DATABASE_URL
- **Auto-updates:** On push to `artifacts/api-server/`

### Frontend (Vercel)
- **Framework:** React/Vite/Next.js
- **CDN:** Global Vercel edge network
- **Auto-updates:** On push to `artifacts/frontend/`

---

## 🔐 Environment Variables

### Create `.env` files locally:

**`artifacts/api-server/.env`**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host/dbname
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
OPENAI_API_KEY=sk-xxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
VAPID_PRIVATE_KEY=xxxxx
VAPID_PUBLIC_KEY=xxxxx
```

**`artifacts/frontend/.env`**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

Then add these to Railway/Vercel dashboards.

---

## ✅ Deployment Status

### GitHub Actions Workflows

**1. Build & Test** (Automatic)
```
Trigger: Push to main/develop or PR
- ✅ Type checking
- ✅ Build verification
- ✅ Dependency validation
```

**2. API Server Deployment** (Automatic)
```
Trigger: Push to main with artifacts/api-server/* changes
- ✅ Install dependencies
- ✅ Build
- ✅ Deploy to Railway
```

**3. Frontend Deployment** (Automatic)
```
Trigger: Push to main with artifacts/frontend/* changes
- ✅ Install dependencies
- ✅ Build
- ✅ Deploy to Vercel
```

---

## 🔍 Monitoring Deployments

### Railway Dashboard
👉 https://railway.app/dashboard
- View logs
- Monitor performance
- Manage environment variables
- Scale resources

### Vercel Dashboard
👉 https://vercel.com/dashboard
- View deployments
- Check analytics
- Manage domains
- View logs

### GitHub Actions
👉 https://github.com/rky956678-afk/future-jaano/actions
- View workflow runs
- Check build status
- Debug failures

---

## 🐛 Troubleshooting

### Deployment Fails - "Missing RAILWAY_TOKEN"
**Solution:** Add `RAILWAY_TOKEN` to GitHub Secrets

### Build Error - "pnpm not found"
**Solution:** 
```bash
npm install -g pnpm
pnpm install
```

### API Server Not Starting
**Solution:** Check Railway logs for errors
```bash
railway logs
```

### Frontend Not Deploying
**Solution:** Check Vercel logs
```bash
vercel logs --tail
```

### Type Check Fails
**Solution:** Fix TypeScript errors
```bash
pnpm run typecheck
```

---

## 📊 Deployment Checklist

- [ ] Repository cloned locally
- [ ] pnpm dependencies installed
- [ ] Railway account created
- [ ] Vercel account created
- [ ] GitHub Secrets configured (4 secrets)
- [ ] Railway project linked
- [ ] Vercel project linked
- [ ] Environment variables set
- [ ] PR created and merged
- [ ] First deployment triggered
- [ ] API accessible at Railway URL
- [ ] Frontend accessible at Vercel URL

---

## 🎯 Next Steps

1. **Monitor first deployment** in GitHub Actions
2. **Test API endpoints** on Railway
3. **Test frontend** on Vercel
4. **Setup custom domain** (optional)
5. **Configure SSL/TLS** (automatic on Vercel)
6. **Setup monitoring** and alerts

---

## 📞 Support Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [pnpm Guide](https://pnpm.io/installation)

---

## 🎉 You're All Set!

Your Future Jaano project is now:
- ✅ Version controlled on GitHub
- ✅ Auto-tested on every push
- ✅ Auto-deployed on merge to main
- ✅ Monitored and scalable
- ✅ Production ready

**Happy Deploying! 🚀**

---

*Generated: 2026-06-15*
*Repository: rky956678-afk/future-jaano*
