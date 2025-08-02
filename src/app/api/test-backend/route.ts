import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'https://minerva-receipt-processor-backend-production.up.railway.app';

export async function GET() {
  try {
    const response = await fetch(`${backendUrl}/trpc/email.checkForReceipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Backend test error:', error);
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...otherData } = body;

    let endpoint = '/trpc/email.checkForReceipts';
    let payload = {};

    switch (action) {
      case 'generateAuthUrl':
        endpoint = '/trpc/email.generateAuthUrl';
        payload = { json: { userId: userId || 'demo-user' } };
        break;
      
      case 'getConnectionStatus':
        endpoint = '/trpc/email.getConnectionStatus';
        payload = { json: { userId: userId || 'demo-user' } };
        break;
      
      case 'checkForReceiptsForUser':
        endpoint = '/trpc/email.checkForReceiptsForUser';
        payload = { json: { userId: userId || 'demo-user' } };
        break;
      
      case 'disconnect':
        endpoint = '/trpc/email.disconnect';
        payload = { json: { userId: userId || 'demo-user' } };
        break;
      
      default:
        // Default to original email check
        endpoint = '/trpc/email.checkForReceipts';
        payload = {};
    }

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Backend API error:', error);
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 });
  }
} 