import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_error&message=' + error, request.url));
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Exchange the authorization code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Use localhost for local development
    const redirectUri = 'http://localhost:3000/api/auth/gmail/callback';
    
    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.redirect(new URL('/?error=oauth_not_configured', request.url));
    }

    console.log('OAuth Callback - Exchanging code for tokens...');

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
      return NextResponse.redirect(new URL('/?error=token_exchange_failed&message=' + tokenData.error, request.url));
    }

    console.log('OAuth Callback - Tokens received, getting user info...');

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    console.log('OAuth Callback - User info received:', userData.email);

    // Now fetch emails with receipts and PDF attachments
    console.log('OAuth Callback - Fetching emails for receipts...');
    
    // Search for emails with receipts, invoices, or PDF attachments
    const gmailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:(receipt OR invoice OR order) has:attachment`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const gmailData = await gmailResponse.json();
    
    let receiptCount = 0;
    let processedReceipts = [];
    
    if (gmailData.messages) {
      receiptCount = gmailData.messages.length;
      
      // Process each email to extract receipt data
      for (let i = 0; i < Math.min(receiptCount, 5); i++) {
        const messageId = gmailData.messages[i].id;
        
        // Get email details
        const messageResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        
        const messageData = await messageResponse.json();
        
        // Extract subject and date
        const subject = messageData.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || 'Unknown';
        const date = messageData.payload?.headers?.find((h: any) => h.name === 'Date')?.value || '';
        
        // Check for PDF attachments
        const hasPdf = messageData.payload?.parts?.some((part: any) => 
          part.mimeType === 'application/pdf' || 
          part.filename?.toLowerCase().includes('.pdf')
        ) || false;
        
        // Simulate AI processing of PDF content
        const simulatedAmount = ['$45.99', '$8.50', '$23.75', '$15.99', '$9.99'][i] || '$0.00';
        const simulatedMerchant = ['Amazon', 'Starbucks', 'Uber', 'Netflix', 'Spotify'][i] || 'Unknown';
        
        processedReceipts.push({
          subject,
          amount: simulatedAmount,
          merchant: simulatedMerchant,
          date: new Date(date).toLocaleDateString(),
          hasPdf
        });
      }
    }

    // Success - redirect to dashboard with success message and user info
    const successUrl = new URL('/', request.url);
    successUrl.searchParams.set('email_connected', 'true');
    successUrl.searchParams.set('email', userData.email || 'unknown');
    successUrl.searchParams.set('name', userData.name || 'User');
    successUrl.searchParams.set('receipt_count', receiptCount.toString());
    successUrl.searchParams.set('processed_receipts', JSON.stringify(processedReceipts));
    
    console.log('OAuth Callback - Redirecting to success page with', receiptCount, 'receipts found');
    
    return NextResponse.redirect(successUrl);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed&message=' + (error instanceof Error ? error.message : 'Unknown error'), request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json({ success: false, error: 'No authorization code provided' });
    }

    // Exchange the authorization code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Use localhost for local development
    const redirectUri = 'http://localhost:3000/api/auth/gmail/callback';
    
    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.json({ success: false, error: 'OAuth not configured' });
    }

    console.log('OAuth Callback POST - Exchanging code for tokens...');

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
      return NextResponse.json({ success: false, error: 'Token exchange failed: ' + tokenData.error });
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    return NextResponse.json({
      success: true,
      email: userData.email,
      name: userData.name,
      accessToken: tokenData.access_token
    });
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ success: false, error: 'OAuth processing failed' });
  }
} 