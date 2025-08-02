import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = 'https://minerva-receipt-processor-production.up.railway.app';
    const response = await fetch(`${backendUrl}/trpc/comparison.compare`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comparison data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison data' },
      { status: 500 }
    );
  }
} 