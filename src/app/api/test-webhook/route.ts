import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to simulate email webhook calls
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, emailType } = body;

    console.log('Testing webhook with service:', service, 'email type:', emailType);

    // Simulate different webhook payloads
    const testPayloads = {
      'mailgun': {
        'sender': 'orders@amazon.com',
        'recipient': 'thakker834@gmail.com',
        'subject': 'Amazon Order Confirmation - Order #12345',
        'body-plain': 'Thank you for your order! Your total was $89.99. Order details: Product A ($45.99), Product B ($44.00).',
        'body-html': '<h2>Order Confirmation</h2><p>Total: $89.99</p><p>Thank you for shopping with Amazon!</p>',
        'timestamp': new Date().toISOString()
      },
      'sendgrid': {
        'from': 'receipts@starbucks.com',
        'to': 'thakker834@gmail.com',
        'subject': 'Starbucks Receipt - Thank you for your purchase',
        'text': 'Your Starbucks purchase: Venti Latte - $8.75. Thank you for visiting Starbucks!',
        'html': '<h2>Starbucks Receipt</h2><p>Venti Latte: $8.75</p><p>Thank you for your purchase!</p>',
        'timestamp': new Date().toISOString()
      },
      'postmark': {
        'From': 'receipts@uber.com',
        'To': 'thakker834@gmail.com',
        'Subject': 'Uber Receipt - Your ride with John',
        'TextBody': 'Your Uber ride: $23.50. Thank you for using Uber!',
        'HtmlBody': '<h2>Uber Receipt</h2><p>Ride: $23.50</p><p>Thank you for using Uber!</p>',
        'Date': new Date().toISOString()
      }
    };

    const testPayload = testPayloads[service as keyof typeof testPayloads] || testPayloads.mailgun;

    // Send the test payload to our webhook endpoint
    const webhookResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/email-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const webhookResult = await webhookResponse.json();

    return NextResponse.json({
      success: true,
      message: `Test webhook sent to /api/email-webhook`,
      service: service,
      payload: testPayload,
      webhookResult: webhookResult
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

// GET endpoint to show available test options
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Email webhook test endpoint',
    availableServices: ['mailgun', 'sendgrid', 'postmark'],
    usage: 'POST with { "service": "mailgun", "emailType": "receipt" }'
  });
} 