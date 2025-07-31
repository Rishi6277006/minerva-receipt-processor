# 🏛️ Minerva - Intelligent Receipt Processing System

A full-stack financial management application that automatically processes receipts from emails, manages ledger entries, and reconciles bank statements with intelligent matching algorithms.

## ✨ Features

### 📧 **Email Processing & Receipt Parsing**
- **Automatic Email Monitoring**: Continuously checks for incoming emails with PDF receipts
- **OCR Integration**: Uses Tesseract.js for advanced text extraction from receipt images
- **Smart Parsing**: AI-powered parsing with fallback to basic parsing
- **Database Storage**: Stores all receipt details in a structured ledger table

### 🖥️ **Modern User Interface**
- **Beautiful Dashboard**: Sleek, responsive design with glass morphism effects
- **Interactive Visualizations**: Spending timeline, progress charts, and insights
- **Real-time Updates**: Live data synchronization across all components
- **Mobile Responsive**: Optimized for all device sizes

### 🏦 **Bank Statement Management**
- **CSV Upload**: Drag-and-drop bank statement upload
- **Smart Parsing**: Automatic transaction extraction and categorization
- **Comparison Engine**: Intelligent matching between ledger and bank transactions
- **Reconciliation Tools**: Clear visualization of matched and unmatched transactions

### 📊 **Advanced Analytics**
- **Spending Insights**: AI-powered spending pattern analysis
- **Category Breakdown**: Visual representation of spending by category
- **Trend Analysis**: Monthly and yearly spending trends
- **Match Rate Analytics**: Transaction reconciliation performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/minerva-receipt-processor.git
   cd minerva-receipt-processor
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   ```

4. **Set up database**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Start development servers**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `apps/frontend`
     - **Build Command**: `pnpm build:frontend`
     - **Output Directory**: `.next`
   - Add environment variables:
     - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL

3. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-project.vercel.app`

### Backend Deployment (Railway)

1. **Prepare backend for deployment**
   ```bash
   cd packages/backend
   ```

2. **Deploy to Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Configure settings:
     - **Root Directory**: `packages/backend`
     - **Build Command**: `pnpm build`
     - **Start Command**: `pnpm start`
   - Add environment variables:
     - `DATABASE_URL`: PostgreSQL connection string
     - `PORT`: 3001
     - `NODE_ENV`: production

3. **Set up database**
   - Add PostgreSQL service in Railway
   - Copy the connection string to `DATABASE_URL`
   - Run migrations: `pnpm db:push`

4. **Update frontend backend URL**
   - Copy your Railway backend URL
   - Update `NEXT_PUBLIC_BACKEND_URL` in Vercel environment variables

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Query + tRPC
- **Type Safety**: TypeScript
- **UI Components**: Radix UI primitives

### Backend (Express + tRPC)
- **Runtime**: Node.js with Express
- **API**: tRPC for type-safe APIs
- **Database**: Prisma ORM with PostgreSQL
- **Email Processing**: Nodemailer + Tesseract.js OCR
- **File Upload**: Multer for file handling

### Database (PostgreSQL)
- **ORM**: Prisma
- **Schema**: Ledger entries, bank transactions, user data
- **Migrations**: Automatic schema management

## 📁 Project Structure

```
minerva/
├── apps/
│   └── frontend/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/             # App Router pages
│       │   ├── components/      # Reusable UI components
│       │   ├── lib/            # Utility functions
│       │   └── utils/          # tRPC configuration
│       └── public/             # Static assets
├── packages/
│   └── backend/                # Express backend API
│       ├── src/
│       │   ├── app/           # Express app setup
│       │   ├── router/        # tRPC router definitions
│       │   ├── services/      # Business logic services
│       │   └── utils/         # Utility functions
│       └── prisma/            # Database schema and migrations
├── prisma/                    # Root Prisma configuration
└── package.json              # Root package.json for monorepo
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/trpc
```

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/minerva"
PORT=3001
NODE_ENV=development
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run frontend tests
pnpm --filter frontend test

# Run backend tests
pnpm --filter @minerva/backend test
```

## 📝 API Documentation

### Ledger Endpoints
- `GET /trpc/ledger.getAll` - Get all ledger entries
- `POST /trpc/ledger.create` - Create new ledger entry
- `PUT /trpc/ledger.update` - Update ledger entry
- `DELETE /trpc/ledger.delete` - Delete ledger entry

### Bank Endpoints
- `GET /trpc/bank.getAll` - Get all bank transactions
- `POST /trpc/bank.uploadStatement` - Upload bank statement CSV
- `POST /trpc/bank.processStatement` - Process uploaded statement

### Comparison Endpoints
- `GET /trpc/compare.getComparison` - Get transaction comparison data
- `POST /trpc/compare.reconcile` - Reconcile transactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** for the amazing React framework
- **tRPC** for type-safe APIs
- **Prisma** for database management
- **Tailwind CSS** for styling
- **Shadcn UI** for beautiful components
- **Tesseract.js** for OCR capabilities

---

**Built with ❤️ for intelligent financial management** 