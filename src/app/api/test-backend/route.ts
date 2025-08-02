import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://minerva-receipt-processor-production.up.railway.app';
    
    // Test the email check endpoint
    const response = await fetch(`${backendUrl}/trpc/email.checkForReceipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Email check completed',
      result: result
    });
  } catch (error) {
    console.error('Error testing backend:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check emails',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 