import { NextResponse } from 'next/server';
import { updateEmergencyStatus } from '@/lib/emergencyStore';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, notes, officer_id } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const event = updateEmergencyStatus(params.id, status, officer_id || 'govtjharkhand123', notes);

    if (!event) {
      return NextResponse.json({ success: false, error: 'Emergency event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Emergency status updated to ${status}`,
      event
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update emergency status' }, { status: 500 });
  }
}
