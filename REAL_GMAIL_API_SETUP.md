# 🚀 Real Gmail API Setup Guide

## ✅ **What We Need to Do:**

**To make REAL Gmail API work (no hardcoding), we need:**

### **1. Google Cloud Project Setup**
1. **Go to**: https://console.cloud.google.com/
2. **Create/Select Project**: `minerva-email-integration`
3. **Enable Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search "Gmail API"
   - Click "Enable"

### **2. Service Account Setup**
1. **Go to "APIs & Services"** → "Credentials"
2. **Click "Create Credentials"** → "Service Account"
3. **Name**: `minerva-gmail-processor`
4. **Click "Create and Continue"**

### **3. Download Service Account Key**
1. **Click on your service account**
2. **Go to "Keys"** tab
3. **Click "Add Key"** → "Create new key"
4. **Choose "JSON"**
5. **Download the JSON file**

### **4. Enable Domain-Wide Delegation**
1. **In Google Cloud Console**:
   - Go to your service account
   - Click "Show domain-wide delegation"
   - Add your domain: `thakker834@gmail.com`
   - Add scope: `https://www.googleapis.com/auth/gmail.readonly`

### **5. Add to Vercel Environment Variables**
1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to "Settings"** → "Environment Variables"
4. **Add**: `GOOGLE_APPLICATION_CREDENTIALS_JSON` with the entire JSON content

## 🔧 **Alternative: Use Google OAuth 2.0**

**If service account is too complex, we can use OAuth:**

### **1. Create OAuth 2.0 Credentials**
1. **Go to "APIs & Services"** → "Credentials"
2. **Click "Create Credentials"** → "OAuth 2.0 Client IDs"
3. **Application type**: "Web application"
4. **Authorized redirect URIs**: Your Vercel URL + `/api/auth/callback`

### **2. Implement OAuth Flow**
- User clicks "Connect Gmail"
- Redirects to Google OAuth
- User authorizes access
- We get access token
- Use token to read Gmail

## 🎯 **Which Approach Do You Want?**

**Option A: Service Account (Recommended)**
- ✅ Works in serverless
- ✅ No user interaction needed
- ✅ More secure
- ❌ Complex setup

**Option B: OAuth 2.0**
- ✅ Easier to understand
- ✅ User controls access
- ❌ Requires user interaction
- ❌ Tokens expire

**Let me know which one you prefer and I'll implement it!** 🚀 