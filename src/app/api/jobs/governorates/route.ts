import { NextResponse } from 'next/server';
import { getAllGovernorates } from '@/data/jobs/lookups';

export async function GET() {
  try {
    const governorates = await getAllGovernorates();
    return NextResponse.json({ success: true, data: governorates });
  } catch (error: any) {
    console.error('Error fetching governorates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
