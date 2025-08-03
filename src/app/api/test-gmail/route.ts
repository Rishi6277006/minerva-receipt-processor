import { NextRequest, NextResponse } from 'next/server';

// Simulated Gmail API test endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Gmail API connection simulation...');

    // Simulate Gmail API connection
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate connection time

    console.log('Gmail API connection simulation successful!');

    return NextResponse.json({
      success: true,
      message: 'Gmail API connection test successful!',
      profile: {
        emailAddress: 'thakker834@gmail.com',
        messagesTotal: 1250,
        threadsTotal: 450
      },
      note: 'This is a simulation. In production, this would connect to real Gmail API.'
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