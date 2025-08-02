import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Test upload endpoint called');
    
    // Check if we can read the request
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      console.log('JSON body received:', body);
      console.log('csvData exists:', !!body.csvData);
      console.log('csvData length:', body.csvData?.length);
      
      if (body.csvData) {
        const lines = body.csvData.split('\n');
        console.log('Number of lines:', lines.length);
        console.log('First line:', lines[0]);
        console.log('Second line:', lines[1]);
        
        return NextResponse.json({
          success: true,
          message: 'CSV data received successfully',
          lineCount: lines.length,
          firstLine: lines[0],
          secondLine: lines[1]
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'No csvData in request body'
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Expected JSON content type'
      });
    }
    
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 