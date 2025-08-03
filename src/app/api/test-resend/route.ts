import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Test endpoint to verify Resend API key is working
export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Resend API key not configured'
      });
    }

    console.log('Testing Resend API key...');
    
    // Test the API key by trying to send a test email
    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['test@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email to verify Resend API key is working.</p>'
      });

      if (error) {
        console.error('Resend API test failed:', error);
        return NextResponse.json({
          success: false,
          error: 'Resend API key test failed',
          details: error
        });
      }

      console.log('Resend API key test successful:', data);
      
      return NextResponse.json({
        success: true,
        message: 'Resend API key is working correctly',
        data: data
      });

    } catch (error) {
      console.error('Resend API test error:', error);
      return NextResponse.json({
        success: false,
        error: 'Resend API test error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('Testing Resend with email:', email);

    // Test sending a real email to the provided address
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Test Email from Minerva Receipt Processor',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify that Resend is working with your email address.</p>
        <p>If you receive this, the email processing system is ready to work with real emails!</p>
        <p>Email: ${email}</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });

    if (error) {
      console.error('Resend email test failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        details: error
      });
    }

    console.log('Resend email test successful:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      data: data,
      email: email
    });

  } catch (error) {
    console.error('Resend test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Resend test error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 