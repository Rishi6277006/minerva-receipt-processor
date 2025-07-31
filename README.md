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
- **Real-time Updates**: Live data processing and updates
- **Mobile Responsive**: Works perfectly on all devices

### 🏦 **Bank Statement Integration**
- **CSV Upload**: Drag & drop bank statement file upload
- **Transaction Parsing**: Extracts amounts, dates, and descriptions
- **Smart Matching**: Compares ledger vs bank transactions with intelligent algorithms

### 🔍 **Advanced Comparison System**
- **Three-Way Matching**: 
  - ✅ **Matched Transactions** (green)
  - 📝 **Ledger Only** (orange) 
  - 🏦 **Bank Only** (blue)
- **Visual Indicators**: Color-coded with action buttons
- **Quick Actions**: Add to ledger, find in bank, export reports

### 🔐 **Authentication & Security**
- **User Authentication**: Login/signup system
- **Secure Processing**: Bank-level security for financial data
- **Session Management**: Persistent user sessions

## 🚀 Tech Stack

### **Frontend**
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn UI** components
- **Lucide React** icons
- **tRPC** for type-safe API calls

### **Backend**
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **Tesseract.js** for OCR processing
- **Multer** for file uploads

### **Database**
- **SQLite** (development)
- **PostgreSQL** (production ready)

### **Deployment**
- **Vercel** for frontend hosting
- **Railway/Render** for backend hosting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/minerva.git
   cd minerva
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd packages/backend && pnpm dev
   
   # Terminal 2 - Frontend
   cd apps/frontend && pnpm dev
   ```

## 🎯 Usage

### **Dashboard Overview**
- View key financial metrics
- Analyze spending patterns
- Monitor recent activity
- Access quick actions

### **Ledger Management**
- View all receipt entries
- Filter by category, date, or amount
- Bulk actions for multiple entries
- Export data for reporting

### **Receipt Upload**
- Drag & drop receipt images
- Automatic OCR processing
- Manual data verification
- Category assignment

### **Bank Reconciliation**
- Upload bank statement CSV
- Automatic transaction matching
- Identify discrepancies
- Generate reconciliation reports

## 🔧 Configuration

### **Environment Variables**
```env
# Database
DATABASE_URL="file:./dev.db"

# Email (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# OpenAI (optional)
OPENAI_API_KEY="your-openai-key"
```

### **Email Setup**
1. Configure SMTP settings in `.env`
2. Enable "Less secure app access" or use app passwords
3. The system will automatically monitor for receipt emails

## 📊 API Endpoints

### **Ledger**
- `GET /api/ledger` - Get all ledger entries
- `POST /api/ledger` - Create new ledger entry
- `PUT /api/ledger/:id` - Update ledger entry
- `DELETE /api/ledger/:id` - Delete ledger entry

### **Bank Transactions**
- `GET /api/bank` - Get all bank transactions
- `POST /api/bank/upload` - Upload bank statement
- `GET /api/bank/compare` - Compare with ledger

### **Receipt Processing**
- `POST /api/receipts/upload` - Upload receipt image
- `POST /api/receipts/process` - Process receipt with OCR

## 🎨 UI/UX Highlights

- **Glass Morphism Design**: Modern, translucent UI elements
- **Gradient Backgrounds**: Beautiful color transitions
- **Micro-animations**: Smooth hover effects and transitions
- **Data Visualizations**: Interactive charts and progress indicators
- **Responsive Layout**: Perfect on desktop, tablet, and mobile

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### **Backend Deployment**
1. Deploy to Railway, Render, or Heroku
2. Set up PostgreSQL database
3. Configure environment variables
4. Update frontend API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tesseract.js** for OCR capabilities
- **Shadcn UI** for beautiful components
- **Vercel** for hosting
- **Prisma** for database management

---

**Built with ❤️ for intelligent financial management** 