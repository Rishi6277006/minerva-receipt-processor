# Email Processing Setup Guide

## 📧 Enable Automatic Receipt Processing from Email

The system can automatically monitor your email inbox for receipt emails with PDF attachments and process them automatically.

### 🔧 Setup Instructions

#### For Gmail Users:

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-factor authentication if not already enabled

2. **Generate App Password**
   - Go to Google Account → Security → App passwords
   - Select "Mail" as the app
   - Generate a 16-character password

3. **Configure Environment Variables**
   Add these to your `packages/backend/.env` file:
   ```
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-16-character-app-password"
   EMAIL_HOST="imap.gmail.com"
   EMAIL_PORT=993
   ```

#### For Other Email Providers:

- **Outlook/Hotmail**: Use `outlook.office365.com` as host
- **Yahoo**: Use `imap.mail.yahoo.com` as host
- **Custom IMAP**: Use your provider's IMAP settings

### 🚀 How It Works

1. **Automatic Monitoring**: The system checks your inbox every 5 minutes
2. **PDF Detection**: Looks for emails with PDF attachments
3. **OCR Processing**: Extracts text from PDF receipts
4. **AI Parsing**: Uses AI to extract vendor, amount, date, etc.
5. **Database Storage**: Automatically adds to your ledger

### 🎯 Features

- ✅ Automatic email monitoring
- ✅ PDF attachment processing
- ✅ OCR text extraction
- ✅ AI-powered receipt parsing
- ✅ Automatic ledger entry creation
- ✅ Manual email check button

### 🔍 Manual Email Check

You can also manually check for receipt emails using the "Check Emails" button on the dashboard.

### ⚠️ Security Notes

- Never use your regular email password
- Always use App Passwords for Gmail
- The system only reads emails, never sends them
- Email credentials are stored securely in environment variables

### 🧪 Testing

To test the email processing:
1. Send yourself an email with a PDF receipt attached
2. Wait for automatic processing or use manual check
3. Check the ledger to see the processed receipt 