import { NextResponse } from 'next/server';
import { getEmergencyEvents } from '@/lib/emergencyStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = getEmergencyEvents();
    return NextResponse.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve emergencies' }, { status: 500 });
  }
}
