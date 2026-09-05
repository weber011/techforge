import { NextResponse } from 'next/server';
import { updateEmergencyStatus } from '@/lib/emergencyStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const officer = body.officer_id || 'govtjharkhand123 (Command Officer)';
    const event = updateEmergencyStatus(params.id, 'ACKNOWLEDGED', officer);

    if (!event) {
      return NextResponse.json({ success: false, error: 'Emergency event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency event acknowledged by Government Command Center.',
      event
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to acknowledge emergency' }, { status: 500 });
  }
}
