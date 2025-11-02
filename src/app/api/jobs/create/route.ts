import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/data/jobs/mutations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createJob(body);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
