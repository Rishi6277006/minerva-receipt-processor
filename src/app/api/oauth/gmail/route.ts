import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get Google OAuth credentials from environment
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://minerva-receipt-processor-frontend-2jdmzwe4c.vercel.app/api/auth/gmail/callback';
    
    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
    }

    // Generate OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&response_type=code` +
      `&access_type=offline` +
      `&prompt=consent`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return NextResponse.json({ error: 'Failed to generate OAuth URL' }, { status: 500 });
  }
} 