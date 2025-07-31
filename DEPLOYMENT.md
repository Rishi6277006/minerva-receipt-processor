# Deployment Guide

## Backend Deployment (Railway)

### Step 1: Deploy to Railway
1. Go to [Railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository: `minerva-receipt-processor`
4. Configure:
   - **Root Directory**: `packages/backend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

### Step 2: Add PostgreSQL Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set `DATABASE_URL` environment variable

### Step 3: Add Environment Variables
In Railway dashboard, add these environment variables:
```
DATABASE_URL=your_postgresql_url (auto-set by Railway)
PORT=3001
NODE_ENV=production
```

### Step 4: Deploy and Get URL
1. Railway will automatically deploy your backend
2. Copy the generated URL (e.g., `https://your-app.railway.app`)

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in
2. Click "New Project" → Import your GitHub repository
3. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `pnpm build:frontend`
   - **Output Directory**: `.next`

### Step 2: Add Environment Variable
1. In Vercel dashboard, go to Settings → Environment Variables
2. Add:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: Your Railway backend URL (e.g., `https://your-app.railway.app`)
   - **Environment**: Production, Preview, Development

### Step 3: Redeploy
1. Go to Deployments tab
2. Click "Redeploy" to apply the environment variable

## Testing the Deployment

1. **Test Backend**: Visit your Railway URL + `/trpc/ledger.getAll`
2. **Test Frontend**: Visit your Vercel URL
3. **Test Connection**: The frontend should now connect to your backend

## Troubleshooting

### Backend Issues
- Check Railway logs for build errors
- Ensure `DATABASE_URL` is set correctly
- Verify Prisma migrations run successfully

### Frontend Issues
- Check Vercel build logs
- Ensure `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Verify CORS is configured properly

### Connection Issues
- Check if backend URL is accessible
- Verify environment variables are set
- Check browser console for CORS errors 