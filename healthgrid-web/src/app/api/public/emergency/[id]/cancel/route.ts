import { NextResponse } from 'next/server';
import { updateEmergencyStatus } from '@/lib/emergencyStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = updateEmergencyStatus(params.id, 'CANCELLED', 'CITIZEN', body.reason || 'Cancelled by citizen');
    
    if (!event) {
      return NextResponse.json({ success: false, error: 'Emergency event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency event cancelled.',
      event
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to cancel emergency' }, { status: 500 });
  }
}
