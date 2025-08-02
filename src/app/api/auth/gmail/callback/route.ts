import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId will be passed as state
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Call backend to handle the OAuth callback
    const backendUrl = process.env.BACKEND_URL || 'https://minerva-receipt-processor-backend-production.up.railway.app';
    
    const response = await fetch(`${backendUrl}/trpc/email.handleCallback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          code,
          userId: state || 'demo-user' // Use demo-user if no state provided
        }
      })
    });

    const result = await response.json();

    if (result.result?.data?.success) {
      // Success - redirect to dashboard with success message
      return NextResponse.redirect(new URL('/?email_connected=true', request.url));
    } else {
      // Error - redirect with error message
      return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
} 