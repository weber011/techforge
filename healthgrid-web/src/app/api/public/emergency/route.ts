import { NextResponse } from 'next/server';
import { createEmergencyEvent } from '@/lib/emergencyStore';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';
import { logApiRequest, logAuditEvent, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function findNearestFacilityId(lat: number, lng: number): { nearestId: string; facilityName: string } {
  let minDistance = Infinity;
  let nearestId = 'RNC-DH-001';
  let facilityName = 'Sadar District Hospital Ranchi';

  RANCHI_FACILITIES_MASTER.forEach(f => {
    const d = Math.hypot(lat - f.latitude, lng - f.longitude);
    if (d < minDistance) {
      minDistance = d;
      nearestId = f.facility_id;
      facilityName = f.facility_name;
    }
  });

  return { nearestId, facilityName };
}

export async function POST(req: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-EMERGENCY');

  try {
    const body = await req.json();
    const { latitude, longitude, location_accuracy, severity, description, user_id, contact_phone, citizen_name } = body;

    // Validate GPS coordinates
    if (latitude === undefined || longitude === undefined || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/public/emergency',
        user: user_id || 'CITIZEN',
        role: 'CITIZEN',
        statusCode: 400,
        message: 'Validation failed: Valid numeric GPS coordinates (latitude, longitude) are required to dispatch 108 emergency.',
        responseTimeMs: duration,
        requestBody: body
      });

      return NextResponse.json({
        success: false,
        error: 'Location is required to send the emergency location. Please enable GPS permissions.'
      }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    const { nearestId: nearest_facility_id, facilityName } = findNearestFacilityId(Number(latitude), Number(longitude));

    const event = createEmergencyEvent({
      latitude: Number(latitude),
      longitude: Number(longitude),
      location_accuracy: Number(location_accuracy) || 10,
      severity: severity || 'CRITICAL',
      description: description || 'Emergency medical alert initiated by citizen from Public Portal.',
      nearest_facility_id,
      user_id: user_id || 'CITIZEN_ANONYMOUS',
      contact_phone: contact_phone || '',
      citizen_name: citizen_name || ''
    });

    const duration = performance.now() - startTime;

    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/public/emergency',
      user: citizen_name || user_id || 'CITIZEN_108',
      role: 'CITIZEN',
      statusCode: 200,
      message: `Dispatched 108 Emergency Event #${event.event_id} [${severity || 'CRITICAL'}] at GPS (${latitude}, ${longitude}) -> Routed to ${facilityName}`,
      responseTimeMs: duration,
      requestBody: body,
      responseSummary: { event_id: event.event_id, nearest_facility: facilityName }
    });

    logAuditEvent({
      action: 'EMERGENCY_ALERT',
      actor: citizen_name ? `${citizen_name} (${contact_phone || 'Citizen'})` : '108_CITIZEN_SOS',
      actorRole: 'CITIZEN',
      targetEntity: 'EMERGENCY_SOS',
      entityId: event.event_id,
      facilityId: nearest_facility_id,
      facilityName,
      details: `108 Citizen SOS Alert #${event.event_id} triggered at GPS Coordinates (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}). Severity: ${severity || 'CRITICAL'}. Nearest facility ${facilityName} alerted.`,
      status: 'SUCCESS',
      metadata: { event_id: event.event_id, latitude, longitude, severity }
    });

    return NextResponse.json({
      success: true,
      message: 'Emergency alert successfully transmitted to Government Command Center.',
      event_id: event.event_id,
      event
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (err: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/public/emergency',
      statusCode: 500,
      message: `Emergency alert processing error: ${err.message}`,
      responseTimeMs: duration
    });

    return NextResponse.json({
      success: false,
      error: 'Emergency alert could not be submitted. Please retry or contact emergency services directly on 108.'
    }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}
