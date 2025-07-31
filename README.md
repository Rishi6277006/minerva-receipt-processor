# Minerva - AI Receipt Processor

AI-powered receipt processing and bank statement comparison system.

## Features

- 📸 **Image Receipt Processing** - Upload receipt images and extract data using AI
- 📊 **Bank Statement Upload** - Upload CSV bank statements for comparison
- 🔍 **Transaction Matching** - Compare ledger entries with bank transactions
- 📈 **Financial Dashboard** - Visualize spending patterns and insights
- 📧 **Email Processing** - Automatically process receipts from email attachments

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, tRPC, Prisma ORM
- **Database**: PostgreSQL (Railway)
- **AI**: OpenAI GPT-4o for receipt parsing
- **OCR**: Tesseract.js for image text extraction
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development servers:
   - Frontend: `npm run dev` (port 3000)
   - Backend: `cd packages/backend && npm run dev` (port 3001)

## Deployment Status

- ✅ **Frontend**: Deployed to Vercel
- ✅ **Backend**: Deployed to Railway with PostgreSQL
- ✅ **Database**: Connected and working
- ✅ **Image Processing**: Ready for testing

---
*Last updated: July 31, 2025 - Backend fully operational*
