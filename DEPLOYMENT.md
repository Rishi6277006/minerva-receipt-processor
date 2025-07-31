# 🚀 Deployment Guide

## Frontend Deployment (Vercel)

### ✅ Current Status: READY TO DEPLOY

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Repository**: 
   - Click "New Project"
   - Import from GitHub: `Rishi6277006/minerva-receipt-processor`
   - Root Directory: `.` (root)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables** (Add after backend is deployed):
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-backend-url.railway.app
   ```

4. **Deploy**: Click "Deploy"

## Backend Deployment (Railway)

### ✅ Current Status: READY TO DEPLOY

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `Rishi6277006/minerva-receipt-processor`
   - Set Root Directory: `packages/backend`

3. **Environment Variables** (Add these):
   ```
   DATABASE_URL=your-postgresql-url
   OPENAI_API_KEY=your-openai-key (optional)
   EMAIL_HOST=your-email-host (optional)
   EMAIL_USER=your-email-user (optional)
   EMAIL_PASS=your-email-password (optional)
   ```

4. **Deploy**: Railway will automatically build and deploy

## 🔗 Connect Frontend to Backend

1. **Get Backend URL**: After Railway deployment, copy the generated URL
2. **Update Vercel**: Add environment variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-backend-url.railway.app
   ```
3. **Redeploy Frontend**: Trigger a new deployment in Vercel

## 📋 Current Features

### ✅ Working Locally:
- Beautiful financial dashboard
- Receipt upload and processing
- Bank statement upload
- Transaction comparison
- Ledger management
- Modern UI with animations

### ✅ Ready for Deployment:
- Frontend: Next.js with Tailwind CSS
- Backend: Node.js with Express and tRPC
- Database: PostgreSQL (Railway)
- File uploads: CSV and image processing
- AI integration: OpenAI for receipt parsing

## 🎯 Next Steps

1. **Deploy Backend to Railway**
2. **Deploy Frontend to Vercel**
3. **Connect them with environment variables**
4. **Test all functionality**

## 🚨 Troubleshooting

### If Vercel shows 404:
- Check Root Directory setting (should be `.`)
- Verify `package.json` is in root
- Check build logs for errors

### If Backend fails to deploy:
- Check Railway logs
- Verify `packages/backend/package.json` exists
- Check environment variables

### If Frontend can't connect to Backend:
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Check CORS settings in backend
- Test backend URL directly 