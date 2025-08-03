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

    // Service account credentials from environment variables
    const serviceAccountKey = {
      "type": "service_account",
      "project_id": process.env.GOOGLE_PROJECT_ID || "minerva-email-integration",
      "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID || "4659363707137ca166063e2ebcce56a1be45066d",
      "private_key": process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDK9gqR5E9sTkrr\n/CSINUix7e5p8icblC00FyHKKN8fldZwcplDaBwkGP2VFtPCYAMKLvKASVPrWJ9f\nvcYvT7mBS/1WrkWdLwRJzS+9CbvqEgchybKIu34IbdsTUUhxdqPlRl/5XX+fZuPV\nH70muLUJw6+KGpEfDpcCea9TgZlhTKng6DBMUdrf15KkNlwpE/sbjNeNyd/JJjH/\neH36+cq04Ck2wpm2UbL1NvvDdSfahWRzWPiXRRBEfJNdCoxdIU0wHAwDXTwfKccW\nYxacejEu7Bb66Barr3OPN+Pi5jMFp2A2N9tt4QAzzC7Oq8TRrMX9VxFt+Xq7+64M\n4bwgRh8VAgMBAAECggEAA+nJuy8uinIMzVwBM4Pp5BrB6NaiAzNQlwG5kkJGrj84\n8Tx+BAF/382AWV2LtUjqOUoKcIeTAwvXltFiS6TUrAK6q1WU3G3JpJQ8m8wSP9y1\nH0unEfsIRQ7vlTT3mc7Y/iF+b22drLi5Iws60TWCfnuzzyZDLtjpkUMM94xqJQ9I\n5mEGR2hzpkPnPXdyuGJNHv8fMPkbsoEAchbEEYEGhCuI3cFSvvD1FYn3veeYeIAj\nVURnUFS8iry0zD2N0ZEsmleiZntV4Y93zwT2zfp7tuyLrf2BuVA3RZWFhBWyPX7I\nFaeCA99+xGfUaAa8SJf3Uo59dSgd+Kt4Bh6q7ZTzQQKBgQD/c1vhe4P628MSGxGy\n5rgJN4lhoH6je62HURMboRIS/5Vd8Pvs/KYPegPgdxzxxeXk3Kh5RgmKpXBTs8tw\nlCK13UtKWVdeK2D/pGh16oinc0KwmvWYFboDEPQhA0qE2NtltAN6+t+z9EVayIGU\n2fCDaf2kaV2zdoEpVLn99hg5TQKBgQDLZcihEBvxnjl5iDGCJteg6eFOMu0YZnOc\nrwrAYcmRN0Rs2EFD46CcvE2ru/zOFsTPSesh5LZHu86Cuypuio5RkQE6oXyDvLqk\n57uyVSMImNf0pojMIqdH7v2FcfX45N7yEsdI/hXAeiiUCHIWK9+cGRm6E3GSb+Tc\nurB8OuXY6QKBgBEBkg1Z1rh9pufuq2f4minq65d3QtcJZc0LZbVCLNzc7Qm7AFqP\nm1KOcfGgnGmwHhT1Z7XjJsF3MBoybwnIouLun5OMjRd01dlPDbFD8uMK9lahilYc\npCyOFWKZQH3Fnh2QNWcbiocFbRSVIqNROwTUqpEmfply+zhQLq2sk4JFAoGBAK0V\nzqeRJ9ZzCQHs7gSNvU1H+d0r5Suwc43QP1v7WyZiW64sUU3OdS0r6QTNkpJmOdEU\nXC2Zjax5m4EQeUlcS0QKG3ujVGxevI38TXOyk3+LYarl1N+yVZwXOlLG6cSGL1rc\ntA3feu8yhTmD/mHzr/QMQCJizXEKGz3i+LCfBl2RAoGBAMuvCkyuCNzWM/NsJwq9\nqUYnP+h/v09o/7btceHxRjlUmm+himFbeAoK200QAtYC7XqDmaX2LMOLLoDrU/ht\nS7NRiw371JeYYj2PpPfCk6dZeed8wL67bS1nk+wTmc+KxWKP1cCfE3yl5+0onDzr\nqQGbFP5FAYYAqi7YklqhNos7\n-----END PRIVATE KEY-----\n",
      "client_email": process.env.GOOGLE_CLIENT_EMAIL || "minerva-email-processor@minerva-email-integration.iam.gserviceaccount.com",
      "client_id": process.env.GOOGLE_CLIENT_ID || "106718038531121381041",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/minerva-email-processor%40minerva-email-integration.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };

    // Create JWT client
    const auth = new google.auth.JWT();
    auth.fromJSON(serviceAccountKey);
    auth.scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    auth.subject = email;

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth });

    console.log('Connecting to Gmail API...');

    // Search for receipt emails
    const searchQuery = 'from:(amazon.com OR starbucks.com OR uber.com OR netflix.com) subject:(receipt OR invoice OR order OR payment)';
    
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