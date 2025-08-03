import { NextRequest, NextResponse } from 'next/server';

// Simple email receiving endpoint for real email processing
export async function POST(request: NextRequest) {
  try {
    console.log('Received real email for processing');
    
    const body = await request.json();
    console.log('Email data:', body);

    // Extract email information
    const emailData = {
      subject: body.subject || 'No Subject',
      from: body.from || 'Unknown Sender',
      to: body.to || [],
      text: body.text || '',
      html: body.html || '',
      attachments: body.attachments || [],
      date: body.date || new Date().toISOString()
    };

    console.log('Processing email:', emailData.subject);

    // Check if this is a receipt email
    const isReceipt = checkIfReceipt(emailData);
    
    if (!isReceipt) {
      console.log('Email is not a receipt');
      return NextResponse.json({
        success: true,
        message: 'Email received but not a receipt',
        processed: false
      });
    }

    // Process the receipt
    const receiptData = await processReceiptEmail(emailData);
    
    if (receiptData) {
      console.log('Successfully processed receipt:', receiptData);
      
      // In a real implementation, save to database
      // For now, we'll return the processed data
      
      return NextResponse.json({
        success: true,
        message: 'Real receipt processed successfully',
        receipt: receiptData,
        processed: true,
        realEmail: true
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to process receipt'
    });

  } catch (error) {
    console.error('Email processing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Email processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Check if email looks like a receipt
function checkIfReceipt(emailData: any): boolean {
  const subject = emailData.subject.toLowerCase();
  const text = emailData.text.toLowerCase();
  const html = emailData.html.toLowerCase();
  
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
    subject.includes(keyword) || text.includes(keyword) || html.includes(keyword)
  );
  
  const hasMerchantKeyword = merchantKeywords.some(keyword => 
    subject.includes(keyword) || text.includes(keyword) || html.includes(keyword)
  );
  
  // Check for amount patterns ($XX.XX)
  const hasAmount = /\$\d+\.\d{2}/.test(subject + text + html);
  
  // Check for attachments (PDFs are common for receipts)
  const hasAttachments = emailData.attachments && emailData.attachments.length > 0;
  
  console.log('Receipt check:', {
    hasReceiptKeyword,
    hasMerchantKeyword,
    hasAmount,
    hasAttachments,
    subject: emailData.subject
  });
  
  return hasReceiptKeyword || (hasMerchantKeyword && hasAmount) || hasAttachments;
}

// Process receipt email and extract data
async function processReceiptEmail(emailData: any) {
  try {
    console.log('Processing receipt email:', emailData.subject);
    
    // Extract basic information
    const receiptData: any = {
      id: `real_${Date.now()}`,
      subject: emailData.subject,
      sender: emailData.from,
      date: emailData.date,
      hasAttachments: emailData.attachments && emailData.attachments.length > 0,
      realEmail: true,
      source: 'real-email'
    };
    
    // Try to extract amount from email content
    const amount = extractAmount(emailData.text + emailData.html);
    if (amount) {
      receiptData.amount = amount;
    }
    
    // Try to extract merchant from sender or content
    const merchant = extractMerchant(emailData.from, emailData.subject, emailData.text + emailData.html);
    if (merchant) {
      receiptData.merchant = merchant;
    }
    
    // Try to extract category based on merchant
    const category = getCategoryFromMerchant(receiptData.merchant);
    if (category) {
      receiptData.category = category;
    }
    
    // Process attachments if any
    if (emailData.attachments && emailData.attachments.length > 0) {
      receiptData.attachments = emailData.attachments.map((att: any) => ({
        filename: att.filename,
        contentType: att.contentType,
        size: att.size
      }));
      
      console.log('Found attachments:', receiptData.attachments);
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

export async function GET() {
  return NextResponse.json({
    message: 'Email receiving endpoint ready',
    usage: 'Send POST request with email data to process real emails',
    endpoint: '/api/receive-email'
  });
} 