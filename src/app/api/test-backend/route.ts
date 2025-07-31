import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    // Test basic connectivity
    const healthResponse = await fetch(`${backendUrl}/health`);
    const healthData = await healthResponse.json();
    
    // Test tRPC endpoint
    const trpcResponse = await fetch(`${backendUrl}/trpc/ledger.getAll`);
    const trpcData = await trpcResponse.json();
    
    return NextResponse.json({
      status: 'success',
      backendUrl,
      health: healthData,
      trpc: trpcData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Backend test error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 