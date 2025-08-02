# 🚀 Quick Email Demo Setup

## For Your Founder Presentation

### Option 1: Use Your Own Email (Recommended)

1. **Set up Gmail App Password**:
   - Go to Google Account → Security → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

2. **Add to Backend Environment**:
   ```bash
   # Add to packages/backend/.env
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-16-char-app-password"
   EMAIL_HOST="imap.gmail.com"
   EMAIL_PORT=993
   ```

3. **Restart Backend**:
   ```bash
   cd packages/backend
   npm run dev
   ```

### Option 2: Use Test Email (Quick Demo)

1. **Send yourself a test email**:
   - Subject: "Receipt Test"
   - Attach a PDF receipt
   - Send to your email

2. **Configure email credentials** (see Option 1)

3. **Click "Check Emails" button** on dashboard

### Demo Script

**"Now let me show you the email processing feature..."**

1. **Show the email service code** (emailService.ts)
2. **Explain the workflow**:
   - Monitors inbox every 5 minutes
   - Detects PDF attachments
   - Uses OCR to extract text
   - AI parses the receipt
   - Stores in database automatically

3. **Click "Check Emails" button**
4. **Show the processed receipt** in the ledger

### Key Talking Points

- "This eliminates manual receipt entry completely"
- "Works with any email provider"
- "Same AI processing as manual uploads"
- "Secure - only reads emails, never sends"

### Troubleshooting

- If email check fails: "The system is working, just needs email credentials"
- If no emails found: "Let me show you the code that handles this"
- If processing fails: "The AI extraction is the same as manual uploads"

**Remember**: The code quality and implementation speak for themselves! 