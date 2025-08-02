import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test with the sample CSV data
    const testCsvData = `Date,Description,Amount,Type
2024-01-15,Grocery Store,45.67,DEBIT
2024-01-16,Gas Station,32.50,DEBIT
2024-01-17,Restaurant,28.95,DEBIT
2024-01-18,Online Purchase,89.99,DEBIT
2024-01-19,Salary Deposit,2500.00,CREDIT
2024-01-20,Utility Bill,156.78,DEBIT
2024-01-21,Pharmacy,23.45,DEBIT
2024-01-22,Coffee Shop,4.50,DEBIT`;

    const backendUrl = 'https://minerva-receipt-processor-production.up.railway.app';
    const response = await fetch(`${backendUrl}/trpc/bank.uploadStatement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csvData: testCsvData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error testing CSV processing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 