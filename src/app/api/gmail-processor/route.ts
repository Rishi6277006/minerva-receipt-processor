import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Real Gmail API processor using service account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('Starting REAL Gmail API processing for:', email);

    // Create service account credentials
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      keyFile: undefined, // Will use default credentials or environment
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth });

    console.log('Connecting to Gmail API...');

    // Search for receipt emails
    const searchQuery = 'from:(amazon.com OR starbucks.com OR uber.com OR netflix.com OR spotify.com OR apple.com) subject:(receipt OR invoice OR order OR payment OR confirmation)';
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 10
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} potential receipt emails`);

    const processedReceipts = [];

    // Process each email
    for (const message of messages) {
      try {
        console.log('Processing message:', message.id);
        
        const messageData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!
        });

        const headers = messageData.data.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();

        // Extract email body
        let body = '';
        if (messageData.data.payload?.body?.data) {
          body = Buffer.from(messageData.data.payload.body.data, 'base64').toString();
        } else if (messageData.data.payload?.parts) {
          const textPart = messageData.data.payload.parts.find((part: any) => part.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
          }
        }

        console.log('Processing email:', subject);

        // Check if this is a receipt
        const isReceipt = checkIfReceipt({ subject, from, text: body });
        
        if (isReceipt) {
          const receiptData = await processReceiptEmail({ subject, from, text: body, date });
          if (receiptData) {
            processedReceipts.push(receiptData);
            console.log('Successfully processed receipt:', receiptData);
          }
        }

      } catch (error) {
        console.error('Error processing message:', error);
      }
    }

    console.log(`Processed ${processedReceipts.length} real receipts from Gmail`);
    
    return NextResponse.json({
      success: true,
      email: email,
      receiptsFound: processedReceipts.length,
      receipts: processedReceipts,
      message: `Successfully processed ${processedReceipts.length} real receipt emails from ${email}`,
      realData: true,
      source: 'gmail-api'
    });

  } catch (error) {
    console.error('Gmail API processing error:', error);
    return NextResponse.json({
      error: 'Gmail API processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Check if email looks like a receipt
function checkIfReceipt(emailData: any): boolean {
  const subject = emailData.subject.toLowerCase();
  const text = emailData.text.toLowerCase();
  
  // Receipt keywords
  const receiptKeywords = [
    'receipt', 'invoice', 'order', 'purchase', 'payment', 'confirmation',
    'thank you for your purchase', 'order confirmation', 'payment receipt',
    'transaction', 'billing', 'subscription', 'renewal'
  ];
  
  // Merchant keywords
  const merchantKeywords = [
    'amazon', 'starbucks', 'uber', 'netflix', 'spotify', 'apple',
    'google', 'microsoft', 'paypal', 'stripe', 'shopify'
  ];
  
  // Check subject and content for receipt indicators
  const hasReceiptKeyword = receiptKeywords.some(keyword => 
    subject.includes(keyword) || text.includes(keyword)
  );
  
  const hasMerchantKeyword = merchantKeywords.some(keyword => 
    subject.includes(keyword) || text.includes(keyword)
  );
  
  // Check for amount patterns ($XX.XX)
  const hasAmount = /\$\d+\.\d{2}/.test(subject + text);
  
  return hasReceiptKeyword || (hasMerchantKeyword && hasAmount);
}

// Process receipt email and extract data
async function processReceiptEmail(emailData: any) {
  try {
    console.log('Processing real receipt email:', emailData.subject);
    
    // Extract basic information
    const receiptData: any = {
      id: `gmail_api_${Date.now()}`,
      subject: emailData.subject,
      sender: emailData.from,
      date: emailData.date,
      realEmail: true,
      source: 'gmail-api'
    };
    
    // Try to extract amount from email content
    const amount = extractAmount(emailData.text);
    if (amount) {
      receiptData.amount = amount;
    }
    
    // Try to extract merchant from sender or content
    const merchant = extractMerchant(emailData.from, emailData.subject, emailData.text);
    if (merchant) {
      receiptData.merchant = merchant;
    }
    
    // Try to extract category based on merchant
    const category = getCategoryFromMerchant(receiptData.merchant);
    if (category) {
      receiptData.category = category;
    }
    
    console.log('Extracted real receipt data:', receiptData);
    return receiptData;
    
  } catch (error) {
    console.error('Error processing real receipt email:', error);
    return null;
  }
}

// Extract amount from text
function extractAmount(text: string): number | null {
  const amountRegex = /\$(\d+\.\d{2})/g;
  const matches = text.match(amountRegex);
  
  if (matches && matches.length > 0) {
    // Take the first amount found
    const amountStr = matches[0].replace('$', '');
    return parseFloat(amountStr);
  }
  
  return null;
}

// Extract merchant from email data
function extractMerchant(from: string, subject: string, content: string): string | null {
  const text = (from + ' ' + subject + ' ' + content).toLowerCase();
  
  const merchants = {
    'amazon': ['amazon', 'orders@amazon'],
    'starbucks': ['starbucks', 'receipts@starbucks'],
    'uber': ['uber', 'receipts@uber'],
    'netflix': ['netflix', 'billing@netflix'],
    'spotify': ['spotify', 'billing@spotify'],
    'apple': ['apple', 'receipts@apple'],
    'google': ['google', 'noreply@google'],
    'microsoft': ['microsoft', 'billing@microsoft'],
    'paypal': ['paypal', 'receipts@paypal']
  };
  
  for (const [merchant, keywords] of Object.entries(merchants)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return merchant.charAt(0).toUpperCase() + merchant.slice(1);
    }
  }
  
  return null;
}

// Get category from merchant
function getCategoryFromMerchant(merchant: string): string | null {
  const categoryMap: { [key: string]: string } = {
    'Amazon': 'Shopping',
    'Starbucks': 'Food & Dining',
    'Uber': 'Transportation',
    'Netflix': 'Entertainment',
    'Spotify': 'Entertainment',
    'Apple': 'Technology',
    'Google': 'Technology',
    'Microsoft': 'Software',
    'PayPal': 'Financial'
  };
  
  return categoryMap[merchant] || null;
} 