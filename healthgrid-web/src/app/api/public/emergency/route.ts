import { NextResponse } from 'next/server';
import { createEmergencyEvent } from '@/lib/emergencyStore';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

function findNearestFacilityId(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearestId = 'RNC-DH-001';

  RANCHI_FACILITIES_MASTER.forEach(f => {
    const d = Math.hypot(lat - f.latitude, lng - f.longitude);
    if (d < minDistance) {
      minDistance = d;
      nearestId = f.facility_id;
    }
  });

  return nearestId;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { latitude, longitude, location_accuracy, severity, description, user_id } = body;

    if (latitude === undefined || longitude === undefined || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return NextResponse.json({
        success: false,
        error: 'Location is required to send the emergency location. Please enable GPS permissions.'
      }, { status: 400 });
    }

    const nearest_facility_id = findNearestFacilityId(Number(latitude), Number(longitude));

    const event = createEmergencyEvent({
      latitude: Number(latitude),
      longitude: Number(longitude),
      location_accuracy: Number(location_accuracy) || 10,
      severity: severity || 'CRITICAL',
      description: description || 'Emergency medical alert initiated by citizen from Public Portal.',
      nearest_facility_id,
      user_id: user_id || 'CITIZEN_ANONYMOUS'
    });

    return NextResponse.json({
      success: true,
      message: 'Emergency alert successfully transmitted to Government Command Center.',
      event_id: event.event_id,
      event
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: 'Emergency alert could not be submitted. Please retry or contact emergency services directly on 108.'
    }, { status: 500 });
  }
}
