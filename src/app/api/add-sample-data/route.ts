import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const backendUrl = 'https://minerva-receipt-processor-production.up.railway.app';
    const response = await fetch(`${backendUrl}/trpc/comparison.addSampleData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error('Failed to add sample data');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding sample data:', error);
    return NextResponse.json(
      { error: 'Failed to add sample data' },
      { status: 500 }
    );
  }
} 