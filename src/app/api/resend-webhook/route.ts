import { NextRequest, NextResponse } from 'next/server';

// REAL email webhook endpoint for Resend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This endpoint receives real emails via Resend webhook
    console.log('Received real email via Resend webhook:', body);
    
    // Extract email data from Resend webhook
    const emailData = {
      from: body.from || body.sender || 'unknown@example.com',
      subject: body.subject || 'No Subject',
      text: body.text || body.body || '',
      html: body.html || '',
      date: body.date || new Date().toISOString(),
      attachments: body.attachments || [],
      messageId: body.messageId || '',
      to: body.to || []
    };
    
    // Check if this looks like a receipt email
    const isReceipt = checkIfReceipt(emailData);
    
    if (isReceipt) {
      // Process the receipt
      const receiptData = await processReceiptEmail(emailData);
      
      return NextResponse.json({
        success: true,
        receipt: receiptData,
        message: 'Real receipt processed successfully via Resend',
        source: 'resend'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Real email received but not a receipt',
      source: 'resend'
    });
    
  } catch (error) {
    console.error('Resend webhook error:', error);
    return NextResponse.json({ 
      error: 'Resend webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function checkIfReceipt(emailData: any): boolean {
  const subject = emailData.subject.toLowerCase();
  const from = emailData.from.toLowerCase();
  const text = emailData.text.toLowerCase();
  
  // Check for receipt-related keywords
  const receiptKeywords = ['receipt', 'invoice', 'order', 'confirmation', 'purchase', 'payment'];
  const merchantKeywords = ['amazon', 'starbucks', 'uber', 'netflix', 'spotify', 'google', 'microsoft', 'apple', 'walmart', 'target'];
  
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
  else if (from.includes('apple')) merchant = 'Apple';
  else if (from.includes('walmart')) merchant = 'Walmart';
  else if (from.includes('target')) merchant = 'Target';
  
  // Determine category
  let category = 'Other';
  if (merchant === 'Amazon' || merchant === 'Walmart' || merchant === 'Target') category = 'Shopping';
  else if (merchant === 'Starbucks') category = 'Food & Dining';
  else if (merchant === 'Uber') category = 'Transportation';
  else if (merchant === 'Netflix' || merchant === 'Spotify') category = 'Entertainment';
  else if (merchant === 'Google' || merchant === 'Microsoft' || merchant === 'Apple') category = 'Software';
  
  return {
    id: `resend_${Date.now()}`,
    subject: emailData.subject,
    sender: emailData.from,
    date: emailData.date,
    amount: amount,
    merchant: merchant,
    category: category,
    hasPdf: emailData.attachments.length > 0,
    pdfContent: emailData.attachments.length > 0 ? 'Real PDF attachment via Resend' : '',
    extractedData: {
      total: parseFloat(amount.replace('$', '')),
      tax: 0,
      items: [emailData.subject],
      transactionId: `RESEND_${Date.now()}`
    },
    realEmail: true,
    source: 'resend',
    messageId: emailData.messageId
  };
} 