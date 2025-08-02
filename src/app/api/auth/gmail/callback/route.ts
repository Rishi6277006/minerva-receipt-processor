import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId will be passed as state
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Exchange the authorization code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'https://minerva-receipt-processor-frontend-2jdmzwe4c.vercel.app/api/auth/gmail/callback';
    
    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.redirect(new URL('/?error=oauth_not_configured', request.url));
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Success - redirect to dashboard with success message and user info
    const successUrl = new URL('/', request.url);
    successUrl.searchParams.set('email_connected', 'true');
    successUrl.searchParams.set('email', userData.email || 'unknown');
    successUrl.searchParams.set('name', userData.name || 'User');
    
    return NextResponse.redirect(successUrl);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
} 