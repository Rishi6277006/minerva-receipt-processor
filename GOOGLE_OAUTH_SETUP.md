# 🔐 Google OAuth 2.0 Setup Guide

## 1. Create Google Cloud Project

1. **Go to**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Name it**: "Minerva Email Integration"

## 2. Enable Gmail API

1. **Go to**: https://console.cloud.google.com/apis/library
2. **Search for "Gmail API"**
3. **Click "Enable"**

## 3. Create OAuth 2.0 Credentials

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Click "Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Application type**: "Web application"
4. **Name**: "Minerva Email Integration"
5. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/gmail/callback` (development)
   - `https://minerva-receipt-processor-frontend-2jdmzwe4c.vercel.app/api/auth/gmail/callback` (production)

## 4. Get Credentials

- **Client ID**: Copy this
- **Client Secret**: Copy this

## 5. Add to Environment Variables

Add these to your Railway backend:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://minerva-receipt-processor-frontend-2jdmzwe4c.vercel.app/api/auth/gmail/callback
``` 