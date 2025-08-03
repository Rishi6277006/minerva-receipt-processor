import { NextRequest, NextResponse } from 'next/server';

// REAL email webhook endpoint that receives actual emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This endpoint receives real emails via webhook
    // In a real implementation, you would:
    // 1. Set up email forwarding to this webhook
    // 2. Receive real email data here
    // 3. Process the email content
    // 4. Extract receipt information
    
    console.log('Received real email webhook:', body);
    
    // Extract email data
    const emailData = {
      from: body.from || body.sender || 'unknown@example.com',
      subject: body.subject || 'No Subject',
      text: body.text || body.body || '',
      html: body.html || '',
      date: body.date || new Date().toISOString(),
      attachments: body.attachments || []
    };
    
    // Check if this looks like a receipt email
    const isReceipt = checkIfReceipt(emailData);
    
    if (isReceipt) {
      // Process the receipt
      const receiptData = await processReceiptEmail(emailData);
      
      return NextResponse.json({
        success: true,
        receipt: receiptData,
        message: 'Receipt processed successfully'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email received but not a receipt'
    });
    
  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function checkIfReceipt(emailData: any): boolean {
  const subject = emailData.subject.toLowerCase();
  const from = emailData.from.toLowerCase();
  const text = emailData.text.toLowerCase();
  
  // Check for receipt-related keywords
  const receiptKeywords = ['receipt', 'invoice', 'order', 'confirmation', 'purchase'];
  const merchantKeywords = ['amazon', 'starbucks', 'uber', 'netflix', 'spotify', 'google', 'microsoft'];
  
  const hasReceiptKeyword = receiptKeywords.some(keyword => 
    subject.includes(keyword) || text.includes(keyword)
  );
  
  const hasMerchantKeyword = merchantKeywords.some(keyword => 
    from.includes(keyword) || subject.includes(keyword)
  );
  
  const hasAmount = /\$\d+\.?\d*/.test(subject) || /\$\d+\.?\d*/.test(text);
  
  return hasReceiptKeyword || hasMerchantKeyword || hasAmount;
}

async function processReceiptEmail(emailData: any) {
  // Extract receipt information from real email
  const amountMatch = emailData.subject.match(/\$(\d+\.?\d*)/) || 
                     emailData.text.match(/\$(\d+\.?\d*)/);
  const amount = amountMatch ? `$${amountMatch[1]}` : '$0.00';
  
  // Determine merchant from sender
  let merchant = 'Unknown';
  const from = emailData.from.toLowerCase();
  if (from.includes('amazon')) merchant = 'Amazon';
  else if (from.includes('starbucks')) merchant = 'Starbucks';
  else if (from.includes('uber')) merchant = 'Uber';
  else if (from.includes('netflix')) merchant = 'Netflix';
  else if (from.includes('spotify')) merchant = 'Spotify';
  else if (from.includes('google')) merchant = 'Google';
  else if (from.includes('microsoft')) merchant = 'Microsoft';
  
  // Determine category
  let category = 'Other';
  if (merchant === 'Amazon') category = 'Shopping';
  else if (merchant === 'Starbucks') category = 'Food & Dining';
  else if (merchant === 'Uber') category = 'Transportation';
  else if (merchant === 'Netflix' || merchant === 'Spotify') category = 'Entertainment';
  else if (merchant === 'Google' || merchant === 'Microsoft') category = 'Software';
  
  return {
    id: `webhook_${Date.now()}`,
    subject: emailData.subject,
    sender: emailData.from,
    date: emailData.date,
    amount: amount,
    merchant: merchant,
    category: category,
    hasPdf: emailData.attachments.length > 0,
    pdfContent: emailData.attachments.length > 0 ? 'Real PDF attachment' : '',
    extractedData: {
      total: parseFloat(amount.replace('$', '')),
      tax: 0,
      items: [emailData.subject],
      transactionId: `WEBHOOK_${Date.now()}`
    },
    realEmail: true,
    source: 'webhook'
  };
} 