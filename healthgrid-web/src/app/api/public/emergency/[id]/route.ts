import { NextResponse } from 'next/server';
import { getEmergencyById } from '@/lib/emergencyStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const event = getEmergencyById(params.id);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Emergency event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Data currently unavailable' }, { status: 500 });
  }
}
