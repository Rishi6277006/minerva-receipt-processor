import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Debug CSV - Request body:', body);
    console.log('Debug CSV - csvData length:', body.csvData?.length);
    console.log('Debug CSV - csvData preview:', body.csvData?.substring(0, 200));
    
    if (!body.csvData) {
      return NextResponse.json({
        success: false,
        error: 'No csvData received'
      });
    }
    
    // Test basic parsing
    const lines = body.csvData.split('\n').filter((line: string) => line.trim() !== '');
    console.log('Debug CSV - Number of lines:', lines.length);
    console.log('Debug CSV - First few lines:', lines.slice(0, 3));
    
    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Not enough lines in CSV'
      });
    }
    
    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    console.log('Debug CSV - Headers:', headers);
    
    return NextResponse.json({
      success: true,
      data: {
        lineCount: lines.length,
        headers: headers,
        firstDataRow: lines[1],
        csvPreview: body.csvData.substring(0, 500)
      }
    });
    
  } catch (error) {
    console.error('Debug CSV error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 