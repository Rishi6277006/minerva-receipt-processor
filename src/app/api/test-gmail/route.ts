import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Simple Gmail API test endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Gmail API connection...');

    // Service account credentials from environment variables
    const serviceAccountKey = {
      "type": "service_account",
      "project_id": process.env.GOOGLE_PROJECT_ID || "minerva-email-integration",
      "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID || "4659363707137ca166063e2ebcce56a1be45066d",
      "private_key": (process.env.GOOGLE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDK9gqR5E9sTkrr\n/CSINUix7e5p8icblC00FyHKKN8fldZwcplDaBwkGP2VFtPCYAMKLvKASVPrWJ9f\nvcYvT7mBS/1WrkWdLwRJzS+9CbvqEgchybKIu34IbdsTUUhxdqPlRl/5XX+fZuPV\nH70muLUJw6+KGpEfDpcCea9TgZlhTKng6DBMUdrf15KkNlwpE/sbjNeNyd/JJjH/\neH36+cq04Ck2wpm2UbL1NvvDdSfahWRzWPiXRRBEfJNdCoxdIU0wHAwDXTwfKccW\nYxacejEu7Bb66Barr3OPN+Pi5jMFp2A2N9tt4QAzzC7Oq8TRrMX9VxFt+Xq7+64M\n4bwgRh8VAgMBAAECggEAA+nJuy8uinIMzVwBM4Pp5BrB6NaiAzNQlwG5kkJGrj84\n8Tx+BAF/382AWV2LtUjqOUoKcIeTAwvXltFiS6TUrAK6q1WU3G3JpJQ8m8wSP9y1\nH0unEfsIRQ7vlTT3mc7Y/iF+b22drLi5Iws60TWCfnuzzyZDLtjpkUMM94xqJQ9I\n5mEGR2hzpkPnPXdyuGJNHv8fMPkbsoEAchbEEYEGhCuI3cFSvvD1FYn3veeYeIAj\nVURnUFS8iry0zD2N0ZEsmleiZntV4Y93zwT2zfp7tuyLrf2BuVA3RZWFhBWyPX7I\nFaeCA99+xGfUaAa8SJf3Uo59dSgd+Kt4Bh6q7ZTzQQKBgQD/c1vhe4P628MSGxGy\n5rgJN4lhoH6je62HURMboRIS/5Vd8Pvs/KYPegPgdxzxxeXk3Kh5RgmKpXBTs8tw\nlCK13UtKWVdeK2D/pGh16oinc0KwmvWYFboDEPQhA0qE2NtltAN6+t+z9EVayIGU\n2fCDaf2kaV2zdoEpVLn99hg5TQKBgQDLZcihEBvxnjl5iDGCJteg6eFOMu0YZnOc\nrwrAYcmRN0Rs2EFD46CcvE2ru/zOFsTPSesh5LZHu86Cuypuio5RkQE6oXyDvLqk\n57uyVSMImNf0pojMIqdH7v2FcfX45N7yEsdI/hXAeiiUCHIWK9+cGRm6E3GSb+Tc\nurB8OuXY6QKBgBEBkg1Z1rh9pufuq2f4minq65d3QtcJZc0LZbVCLNzc7Qm7AFqP\nm1KOcfGgnGmwHhT1Z7XjJsF3MBoybwnIouLun5OMjRd01dlPDbFD8uMK9lahilYc\npCyOFWKZQH3Fnh2QNWcbiocFbRSVIqNROwTUqpEmfply+zhQLq2sk4JFAoGBAK0V\nzqeRJ9ZzCQHs7gSNvU1H+d0r5Suwc43QP1v7WyZiW64sUU3OdS0r6QTNkpJmOdEU\nXC2Zjax5m4EQeUlcS0QKG3ujVGxevI38TXOyk3+LYarl1N+yVZwXOlLG6cSGL1rc\ntA3feu8yhTmD/mHzr/QMQCJizXEKGz3i+LCfBl2RAoGBAMuvCkyuCNzWM/NsJwq9\nqUYnP+h/v09o/7btceHxRjlUmm+himFbeAoK200QAtYC7XqDmaX2LMOLLoDrU/ht\nS7NRiw371JeYYj2PpPfCk6dZeed8wL67bS1nk+wTmc+KxWKP1cCfE3yl5+0onDzr\nqQGbFP5FAYYAqi7YklqhNos7\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n'),
      "client_email": process.env.GOOGLE_CLIENT_EMAIL || "minerva-email-processor@minerva-email-integration.iam.gserviceaccount.com",
      "client_id": process.env.GOOGLE_CLIENT_ID || "106718038531121381041",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/minerva-email-processor%40minerva-email-integration.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };

    console.log('Service account key loaded:', {
      project_id: serviceAccountKey.project_id,
      client_email: serviceAccountKey.client_email,
      private_key_length: serviceAccountKey.private_key?.length || 0
    });

    // Create JWT client
    const auth = new google.auth.JWT();
    auth.fromJSON(serviceAccountKey);
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