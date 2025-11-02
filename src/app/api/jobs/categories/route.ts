import { NextResponse } from 'next/server';
import { getActiveJobCategories } from '@/data/jobs/lookups';

export async function GET() {
  try {
    const categories = await getActiveJobCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
