import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to simulate real email data being sent to webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('Testing webhook with email:', email);

    // Simulate real email data that would be sent to webhook
    const realEmailData = {
      from: 'orders@amazon.com',
      subject: 'Amazon Order Receipt - Order #12345',
      text: 'Thank you for your order! Your receipt for $45.99 is attached.',
      html: '<p>Thank you for your order! Your receipt for $45.99 is attached.</p>',
      date: new Date().toISOString(),
      attachments: [
        {
          filename: 'receipt.pdf',
          contentType: 'application/pdf',
          size: 1024
        }
      ]
    };

    // Send this real email data to the webhook
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/email-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(realEmailData)
    });

    const webhookResult = await webhookResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Webhook test completed',
      emailData: realEmailData,
      webhookResult: webhookResult
    });

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({ 
      error: 'Webhook test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook test endpoint',
    instructions: 'Send POST request with email to test webhook processing'
  });
} 