import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Simple test to check if googleapis package works
export async function GET(request: NextRequest) {
  try {
    console.log('Testing googleapis package...');

    // Just test if we can create a basic auth object
    const auth = new google.auth.JWT();
    
    console.log('JWT auth object created successfully');

    return NextResponse.json({
      success: true,
      message: 'googleapis package is working correctly',
      test: 'JWT auth object created successfully'
    });

  } catch (error) {
    console.error('googleapis test error:', error);
    return NextResponse.json({
      success: false,
      error: 'googleapis package test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 