import { NextResponse } from 'next/server';

export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { imageData, filename } = await request.json();
    
    const backendUrl = 'https://minerva-receipt-processor-production.up.railway.app';
    const response = await fetch(`${backendUrl}/trpc/receipt.uploadImage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        filename
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing image upload:', error);
    return NextResponse.json({
      error: 'Failed to process image upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 