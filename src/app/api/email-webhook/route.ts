import { NextRequest, NextResponse } from 'next/server';

// Clean webhook-based email processor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Email webhook received:', JSON.stringify(body, null, 2));

    // Extract email data from webhook payload
    const emailData = extractEmailData(body);
    
    if (!emailData) {
      console.log('No valid email data found in webhook');
      return NextResponse.json({ success: false, message: 'No valid email data' });
    }

    console.log('Processing email:', emailData.subject);

    // Check if this is a receipt
    const isReceipt = checkIfReceipt(emailData);
    
    if (!isReceipt) {
      console.log('Email is not a receipt, skipping');
      return NextResponse.json({ success: true, message: 'Email processed (not a receipt)' });
    }

    // Process receipt email
    const receiptData = await processReceiptEmail(emailData);
    
    if (receiptData) {
      console.log('Successfully processed receipt:', receiptData);
      
      // Here you would save to your database
      // await saveReceiptToDatabase(receiptData);
      
      return NextResponse.json({
        success: true,
        message: 'Receipt processed successfully',
        receipt: receiptData
      });
    }

    return NextResponse.json({ success: false, message: 'Failed to process receipt' });

  } catch (error) {
    console.error('Email webhook processing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Extract email data from various webhook formats
function extractEmailData(webhookBody: any) {
  // Mailgun format
  if (webhookBody['sender'] && webhookBody['subject']) {
    return {
      from: webhookBody['sender'],
      to: webhookBody['recipient'],
      subject: webhookBody['subject'],
      text: webhookBody['body-plain'] || webhookBody['body'] || '',
      html: webhookBody['body-html'] || '',
      attachments: webhookBody['attachments'] || [],
      timestamp: webhookBody['timestamp'] || new Date().toISOString()
    };
  }

  // SendGrid Inbound Parse format
  if (webhookBody['from'] && webhookBody['subject']) {
    return {
      from: webhookBody['from'],
      to: webhookBody['to'],
      subject: webhookBody['subject'],
      text: webhookBody['text'] || '',
      html: webhookBody['html'] || '',
      attachments: webhookBody['attachments'] || [],
      timestamp: webhookBody['timestamp'] || new Date().toISOString()
    };
  }

  // Postmark format
  if (webhookBody['From'] && webhookBody['Subject']) {
    return {
      from: webhookBody['From'],
      to: webhookBody['To'],
      subject: webhookBody['Subject'],
      text: webhookBody['TextBody'] || '',
      html: webhookBody['HtmlBody'] || '',
      attachments: webhookBody['Attachments'] || [],
      timestamp: webhookBody['Date'] || new Date().toISOString()
    };
  }

  // Generic format
  if (webhookBody['email'] || webhookBody['message']) {
    const email = webhookBody['email'] || webhookBody['message'];
    return {
      from: email['from'] || email['sender'],
      to: email['to'] || email['recipient'],
      subject: email['subject'] || email['title'],
      text: email['text'] || email['body'] || email['content'] || '',
      html: email['html'] || '',
      attachments: email['attachments'] || [],
      timestamp: email['timestamp'] || email['date'] || new Date().toISOString()
    };
  }

  return null;
}

// Check if email looks like a receipt
function checkIfReceipt(emailData: any): boolean {
  const subject = (emailData.subject || '').toLowerCase();
  const text = (emailData.text || '').toLowerCase();
  const html = (emailData.html || '').toLowerCase();
  
  // Receipt keywords
  const receiptKeywords = [
    'receipt', 'invoice', 'order', 'purchase', 'payment', 'confirmation',
    'thank you for your purchase', 'order confirmation', 'payment receipt',
    'transaction', 'billing', 'subscription', 'renewal', 'statement'
  ];
  
  // Merchant keywords
  const merchantKeywords = [
    'amazon', 'starbucks', 'uber', 'netflix', 'spotify', 'apple',
    'google', 'microsoft', 'paypal', 'stripe', 'shopify', 'walmart',
    'target', 'costco', 'home depot', 'lowes', 'best buy'
  ];
  
  // Check subject and content for receipt indicators
  const hasReceiptKeyword = receiptKeywords.some(keyword => 
    subject.includes(keyword) || text.includes(keyword) || html.includes(keyword)
  );
  
  const hasMerchantKeyword = merchantKeywords.some(keyword => 
    subject.includes(keyword) || text.includes(keyword) || html.includes(keyword)
  );
  
  // Check for amount patterns ($XX.XX)
  const hasAmount = /\$\d+\.\d{2}/.test(subject + text + html);
  
  return hasReceiptKeyword || (hasMerchantKeyword && hasAmount);
}

// Process receipt email and extract data
async function processReceiptEmail(emailData: any) {
  try {
    console.log('Processing receipt email:', emailData.subject);
    
    // Extract basic information
    const receiptData: any = {
      id: `webhook_${Date.now()}`,
      subject: emailData.subject,
      sender: emailData.from,
      recipient: emailData.to,
      date: emailData.timestamp,
      realEmail: true,
      source: 'email-webhook'
    };
    
    // Try to extract amount from email content
    const amount = extractAmount(emailData.text + ' ' + emailData.html);
    if (amount) {
      receiptData.amount = amount;
    }
    
    // Try to extract merchant from sender or content
    const merchant = extractMerchant(emailData.from, emailData.subject, emailData.text + ' ' + emailData.html);
    if (merchant) {
      receiptData.merchant = merchant;
    }
    
    // Try to extract category based on merchant
    const category = getCategoryFromMerchant(receiptData.merchant);
    if (category) {
      receiptData.category = category;
    }
    
    console.log('Extracted receipt data:', receiptData);
    return receiptData;
    
  } catch (error) {
    console.error('Error processing receipt email:', error);
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
    'amazon': ['amazon', 'orders@amazon', 'shipment-tracking@amazon'],
    'starbucks': ['starbucks', 'receipts@starbucks', 'starbucks.com'],
    'uber': ['uber', 'receipts@uber', 'uber.com'],
    'netflix': ['netflix', 'billing@netflix', 'netflix.com'],
    'spotify': ['spotify', 'billing@spotify', 'spotify.com'],
    'apple': ['apple', 'receipts@apple', 'apple.com'],
    'google': ['google', 'noreply@google', 'google.com'],
    'microsoft': ['microsoft', 'billing@microsoft', 'microsoft.com'],
    'paypal': ['paypal', 'receipts@paypal', 'paypal.com'],
    'walmart': ['walmart', 'receipts@walmart', 'walmart.com'],
    'target': ['target', 'receipts@target', 'target.com'],
    'costco': ['costco', 'receipts@costco', 'costco.com']
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
    'PayPal': 'Financial',
    'Walmart': 'Shopping',
    'Target': 'Shopping',
    'Costco': 'Shopping'
  };
  
  return categoryMap[merchant] || null;
} 