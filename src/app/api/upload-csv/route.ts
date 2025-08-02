import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { csvData } = await request.json();
    
    const backendUrl = 'https://minerva-receipt-processor-production.up.railway.app';
    const response = await fetch(`${backendUrl}/trpc/bank.uploadStatement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csvData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing CSV upload:', error);
    return NextResponse.json({
      error: 'Failed to process CSV upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 