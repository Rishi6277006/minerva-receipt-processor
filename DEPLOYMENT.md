# Deployment Guide - Minerva Receipt Processor

This guide will help you deploy the Minerva Receipt Processing System to Vercel.

## 🚀 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Set up a PostgreSQL database (Vercel Postgres, Neon, or Supabase)
4. **OpenAI API Key**: Get your API key from [OpenAI](https://platform.openai.com)

## 📋 Step-by-Step Deployment

### 1. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new project or select existing
3. Go to Storage → Create Database
4. Choose PostgreSQL
5. Note down the connection string

#### Option B: External PostgreSQL
- **Neon**: [neon.tech](https://neon.tech)
- **Supabase**: [supabase.com](https://supabase.com)
- **Railway**: [railway.app](https://railway.app)

### 2. Frontend Deployment

1. **Connect Repository**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set root directory to `apps/frontend`

2. **Configure Build Settings**:
   ```
   Framework Preset: Next.js
   Root Directory: apps/frontend
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

3. **Environment Variables**:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app/trpc
   ```

### 3. Backend Deployment

#### Option A: Vercel Serverless Functions

1. **Create API Routes**:
   Create `apps/frontend/src/app/api/trpc/[trpc]/route.ts`:

   ```typescript
   import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
   import { appRouter } from '../../../../../packages/backend/src/router';
   import { createContext } from '../../../../../packages/backend/src/context';

   const handler = (req: Request) =>
     fetchRequestHandler({
       endpoint: '/api/trpc',
       req,
       router: appRouter,
       createContext,
     });

   export { handler as GET, handler as POST };
   ```

2. **Environment Variables** (in frontend project):
   ```
   DATABASE_URL=your-postgresql-connection-string
   OPENAI_API_KEY=your-openai-api-key
   ```

#### Option B: Separate Backend Project

1. Create a new Vercel project for the backend
2. Set root directory to `packages/backend`
3. Configure as Node.js project
4. Set environment variables

### 4. Database Migration

1. **Local Migration** (recommended):
   ```bash
   cd packages/backend
   pnpm prisma db push
   ```

2. **Or use Vercel CLI**:
   ```bash
   npx vercel env pull .env
   pnpm prisma db push
   ```

### 5. Environment Variables Summary

#### Frontend (.env.local):
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app/trpc
```

#### Backend (.env):
```env
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key
```

## 🔧 Configuration

### Custom Domains
1. Go to your Vercel project settings
2. Navigate to Domains
3. Add your custom domain
4. Configure DNS records

### Environment Variables Management
1. Go to Project Settings → Environment Variables
2. Add variables for each environment (Production, Preview, Development)
3. Use the same variables across environments

## 🧪 Testing Deployment

### 1. Test Frontend
- Visit your deployed frontend URL
- Check if the dashboard loads
- Test navigation between pages

### 2. Test Backend
- Try uploading a sample CSV file
- Test receipt processing
- Verify database connections

### 3. Test Database
- Check if data is being stored
- Verify transaction matching works
- Test comparison functionality

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DATABASE_URL format
   - Check if database is accessible
   - Ensure SSL is configured correctly

2. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

3. **API Errors**:
   - Verify environment variables are set
   - Check CORS configuration
   - Ensure tRPC endpoints are working

4. **OpenAI API Errors**:
   - Verify API key is correct
   - Check API usage limits
   - Ensure proper error handling

### Debug Commands

```bash
# Check build locally
pnpm build

# Test database connection
pnpm db:push

# Run development servers
pnpm dev
```

## 📊 Monitoring

### Vercel Analytics
1. Enable Vercel Analytics in project settings
2. Monitor performance metrics
3. Track user interactions

### Error Monitoring
1. Set up Sentry integration
2. Monitor API errors
3. Track database performance

## 🔄 Continuous Deployment

### GitHub Integration
1. Connect GitHub repository to Vercel
2. Enable automatic deployments
3. Set up branch protection rules

### Environment Management
1. Use different environments for staging/production
2. Set up preview deployments for PRs
3. Configure environment-specific variables

## 📈 Performance Optimization

### Frontend
- Enable Next.js optimizations
- Use image optimization
- Implement proper caching

### Backend
- Optimize database queries
- Use connection pooling
- Implement proper error handling

### Database
- Add proper indexes
- Optimize schema design
- Monitor query performance

## 🔒 Security

### Environment Variables
- Never commit sensitive data
- Use Vercel's secure environment variable storage
- Rotate API keys regularly

### Database Security
- Use SSL connections
- Implement proper access controls
- Regular security updates

### API Security
- Implement rate limiting
- Validate all inputs
- Use proper authentication (if needed)

---

**Need Help?** Check the [Vercel Documentation](https://vercel.com/docs) or create an issue in the repository. 