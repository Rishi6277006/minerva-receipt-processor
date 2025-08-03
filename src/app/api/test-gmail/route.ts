import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Real Gmail API test endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Gmail API connection...');

    // Get service account credentials from environment
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (!credentialsJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set');
    }

    const credentials = JSON.parse(credentialsJson);
    console.log('Service account credentials loaded:', {
      project_id: credentials.project_id,
      client_email: credentials.client_email
    });

    // Create JWT client for service account
    const auth = new google.auth.JWT();
    auth.fromJSON(credentials);
    auth.scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    
    // Test with a specific email
    const testEmail = 'thakker834@gmail.com';
    auth.subject = testEmail;

    console.log('JWT auth created, subject set to:', testEmail);

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth });

    console.log('Gmail API client created, testing connection...');

    // Test connection by getting profile
    const profile = await gmail.users.getProfile({
      userId: 'me'
    });

    console.log('Gmail API connection successful!', {
      emailAddress: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal
    });

    return NextResponse.json({
      success: true,
      message: 'Gmail API connection test successful!',
      profile: {
        emailAddress: profile.data.emailAddress,
        messagesTotal: profile.data.messagesTotal,
        threadsTotal: profile.data.threadsTotal
      }
    });

  } catch (error) {
    console.error('Gmail API test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Gmail API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 