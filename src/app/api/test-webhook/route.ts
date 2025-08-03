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

    // Send each test email to the webhook
    for (const testEmail of testEmails) {
      try {
        console.log('Sending test email to webhook:', testEmail.data.subject);
        
        const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/resend-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testEmail)
        });

        const result = await response.json();
        results.push({
          email: testEmail.data.subject,
          success: result.success,
          message: result.message,
          receipt: result.receipt
        });

        console.log('Webhook response:', result);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('Error sending test email:', error);
        results.push({
          email: testEmail.data.subject,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successfulReceipts = results.filter(r => r.success && r.receipt);
    
    return NextResponse.json({
      success: true,
      message: `Processed ${testEmails.length} test emails`,
      results: results,
      receiptsFound: successfulReceipts.length,
      receipts: successfulReceipts.map(r => r.receipt)
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

export async function GET() {
  return NextResponse.json({
    message: 'Test webhook endpoint ready',
    usage: 'POST with { "email": "your-email@example.com" } to test webhook processing'
  });
} 