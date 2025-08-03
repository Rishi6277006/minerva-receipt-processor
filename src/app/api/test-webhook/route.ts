import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to simulate sending real receipt emails to the webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('Testing webhook with email:', email);

    // Simulate real receipt emails that would be sent to the webhook
    const testEmails = [
      {
        type: 'email.received',
        data: {
          subject: 'Your Amazon order has shipped - Order #12345',
          from: 'orders@amazon.com',
          to: [email],
          text: 'Thank you for your order! Your total was $45.99. Order details: Product A ($25.99), Product B ($20.00).',
          html: '<h2>Order Confirmation</h2><p>Total: $45.99</p><p>Thank you for shopping with Amazon!</p>',
          attachments: [],
          date: new Date().toISOString()
        }
      },
      {
        type: 'email.received',
        data: {
          subject: 'Starbucks Receipt - Thank you for your purchase',
          from: 'receipts@starbucks.com',
          to: [email],
          text: 'Your Starbucks purchase: Venti Latte - $8.75. Thank you for visiting Starbucks!',
          html: '<h2>Starbucks Receipt</h2><p>Venti Latte: $8.75</p><p>Thank you for your purchase!</p>',
          attachments: [
            {
              filename: 'starbucks-receipt.pdf',
              contentType: 'application/pdf',
              size: 1024
            }
          ],
          date: new Date().toISOString()
        }
      },
      {
        type: 'email.received',
        data: {
          subject: 'Uber Receipt - Your ride with John',
          from: 'receipts@uber.com',
          to: [email],
          text: 'Your Uber ride: $23.50. From: Home To: Downtown. Thank you for riding with Uber!',
          html: '<h2>Uber Receipt</h2><p>Ride: $23.50</p><p>From: Home To: Downtown</p>',
          attachments: [],
          date: new Date().toISOString()
        }
      }
    ];

    const results = [];
    const processedReceipts = [];

    // Process each test email directly (simulating webhook processing)
    for (const testEmail of testEmails) {
      try {
        console.log('Processing test email:', testEmail.data.subject);
        
        // Extract email data from webhook payload
        const emailData = extractEmailData(testEmail);
        
        if (!emailData) {
          console.log('No valid email data found');
          results.push({
            email: testEmail.data.subject,
            success: false,
            message: 'No valid email data'
          });
          continue;
        }

        console.log('Processing email:', emailData.subject);

        // Check if this email looks like a receipt
        const isReceipt = checkIfReceipt(emailData);
        
        if (!isReceipt) {
          console.log('Email is not a receipt, skipping');
          results.push({
            email: testEmail.data.subject,
            success: true,
            message: 'Email processed but not a receipt'
          });
          continue;
        }

        // Process the receipt email
        const receiptData = await processReceiptEmail(emailData);
        
        if (receiptData) {
          console.log('Successfully processed receipt:', receiptData);
          processedReceipts.push(receiptData);
          
          results.push({
            email: testEmail.data.subject,
            success: true,
            message: 'Real receipt processed successfully',
            receipt: receiptData
          });
        } else {
          results.push({
            email: testEmail.data.subject,
            success: false,
            message: 'Failed to process receipt'
          });
        }
        
        // Add delay between processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error processing test email:', error);
        results.push({
          email: testEmail.data.subject,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${testEmails.length} test emails`,
      results: results,
      receiptsFound: processedReceipts.length,
      receipts: processedReceipts
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test webhook failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Extract email data from webhook payload
function extractEmailData(webhookData: any) {
  try {
    // Handle different webhook formats
    if (webhookData.type === 'email.received') {
      // Resend webhook format
      return {
        subject: webhookData.data?.subject || 'No Subject',
        from: webhookData.data?.from || 'Unknown Sender',
        to: webhookData.data?.to || [],
        text: webhookData.data?.text || '',
        html: webhookData.data?.html || '',
        attachments: webhookData.data?.attachments || [],
        date: webhookData.data?.date || new Date().toISOString()
      };
    } else if (webhookData.email) {
      // Generic email webhook format
      return {
        subject: webhookData.email.subject || 'No Subject',
        from: webhookData.email.from || 'Unknown Sender',
        to: webhookData.email.to || [],
        text: webhookData.email.text || '',
        html: webhookData.email.html || '',
        attachments: webhookData.email.attachments || [],
        date: webhookData.email.date || new Date().toISOString()
      };
    } else {
      // Try to extract from raw data
      return {
        subject: webhookData.subject || 'No Subject',
        from: webhookData.from || 'Unknown Sender',
        to: webhookData.to || [],
        text: webhookData.text || '',
        html: webhookData.html || '',
        attachments: webhookData.attachments || [],
        date: webhookData.date || new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error extracting email data:', error);
    return null;
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
      id: `webhook_${Date.now()}`,
      subject: emailData.subject,
      sender: emailData.from,
      date: emailData.date,
      hasAttachments: emailData.attachments && emailData.attachments.length > 0,
      realEmail: true,
      source: 'resend-webhook'
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
      
      // In a real implementation, you would process PDF attachments here
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
    message: 'Test webhook endpoint ready',
    usage: 'POST with { "email": "your-email@example.com" } to test webhook processing'
  });
} 