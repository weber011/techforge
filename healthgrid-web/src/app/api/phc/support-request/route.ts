import { NextResponse } from 'next/server';
import { 
  getAllPhcGovtRequests, 
  getPhcGovtRequestsForFacility, 
  createPhcGovtRequest, 
  respondToPhcGovtRequest,
  getPhcLiveState
} from '@/lib/phcStore';
import { logApiRequest, logAuditEvent, generateRequestId } from '@/lib/logger';

const recentSupportHashes = new Map<string, number>();

export async function GET(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-SUP-GET');

  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facility_id');
    const email = searchParams.get('email');

    if (facilityId || email) {
      const requests = getPhcGovtRequestsForFacility(facilityId || email!);
      const duration = performance.now() - startTime;

      logApiRequest({
        requestId: reqId,
        method: 'GET',
        endpoint: '/api/phc/support-request',
        user: email || facilityId,
        role: 'PHC_OFFICER',
        statusCode: 200,
        message: `Fetched ${requests.length} PHC-to-Govt support requests for ${facilityId || email}`,
        responseTimeMs: duration
      });

      return NextResponse.json({ success: true, requests }, { headers: { 'X-Request-Id': reqId } });
    }

    const all = getAllPhcGovtRequests();
    const duration = performance.now() - startTime;

    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/phc/support-request',
      user: 'GOVT_COMMAND',
      role: 'GOVERNMENT_OFFICIAL',
      statusCode: 200,
      message: `Retrieved all ${all.length} pending and resolved PHC requisitions at State Radar`,
      responseTimeMs: duration
    });

    return NextResponse.json({ success: true, requests: all }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/phc/support-request',
      statusCode: 500,
      message: `Error fetching support requests: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}

// PHC creates a request / medicine escalation to Government
export async function POST(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-SUP-POST');

  try {
    const body = await request.json();
    const { source_facility_id, category, urgency, title, description, requested_by_officer } = body;

    // 1. Validation
    if (!source_facility_id || !title || !description) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/support-request',
        statusCode: 400,
        message: 'Validation failed: source_facility_id, title, and description are required',
        responseTimeMs: duration,
        requestBody: body
      });
      return NextResponse.json({ 
        success: false, 
        error: 'source_facility_id, title, and description are required' 
      }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    // 2. Duplicate Detection
    const duplicateKey = `${source_facility_id}:${title.trim().toLowerCase()}`;
    const lastTime = recentSupportHashes.get(duplicateKey);
    const now = Date.now();

    if (lastTime && (now - lastTime) < 10000) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/support-request',
        user: source_facility_id,
        role: 'PHC_OFFICER',
        statusCode: 409,
        message: `Duplicate support escalation rejected for "${title}" within 10s window`,
        responseTimeMs: duration,
        requestBody: body
      });

      return NextResponse.json({
        success: false,
        error: 'Duplicate request: An identical support requisition was created seconds ago. Prevented duplicate escalation.',
        duplicate_detected: true
      }, { status: 409, headers: { 'X-Request-Id': reqId } });
    }
    recentSupportHashes.set(duplicateKey, now);

    const newReq = createPhcGovtRequest({
      source_facility_id,
      category: category || 'GENERAL_SUPPORT',
      urgency: urgency || 'CRITICAL_URGENT',
      title,
      description,
      requested_by_officer
    });

    const duration = performance.now() - startTime;
    const facilityState = getPhcLiveState(source_facility_id);

    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/support-request',
      user: source_facility_id,
      role: 'PHC_OFFICER',
      statusCode: 200,
      message: `Escalated requisition #${newReq.request_code} (${category || 'GENERAL_SUPPORT'}) from ${facilityState?.facility_name || source_facility_id} to Government Command Radar`,
      responseTimeMs: duration,
      requestBody: body,
      responseSummary: { request_code: newReq.request_code, urgency: newReq.urgency }
    });

    logAuditEvent({
      action: category === 'EMERGENCY_DRUG_REQUISITION' ? 'MEDICINE_REQUEST' : 'EMERGENCY_ALERT',
      actor: requested_by_officer || source_facility_id,
      actorRole: 'PHC_OFFICER',
      targetEntity: 'DIRECTIVE',
      entityId: newReq.request_code,
      facilityId: source_facility_id,
      facilityName: facilityState?.facility_name || source_facility_id,
      details: `Requisition #${newReq.request_code} [${newReq.urgency}] escalated to State Health Command: "${newReq.title}". Category: ${newReq.category}.`,
      status: 'SUCCESS',
      metadata: { request_id: newReq.id, request_code: newReq.request_code, urgency: newReq.urgency }
    });

    return NextResponse.json({
      success: true,
      message: 'Support request escalated to State Health Command Center',
      request: newReq
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/support-request',
      statusCode: 500,
      message: `Error escalating support request: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}

// Government responds or dispatches support to PHC
export async function PUT(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-SUP-PUT');

  try {
    const body = await request.json();
    const { request_id, status, response_notes, officer_id } = body;

    if (!request_id || !status) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'PUT',
        endpoint: '/api/phc/support-request',
        statusCode: 400,
        message: 'Validation failed: request_id and status are required',
        responseTimeMs: duration
      });
      return NextResponse.json({ 
        success: false, 
        error: 'request_id and status are required' 
      }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    const updated = respondToPhcGovtRequest({
      request_id,
      status,
      response_notes: response_notes || '',
      officer_id
    });

    const duration = performance.now() - startTime;

    if (!updated) {
      logApiRequest({
        requestId: reqId,
        method: 'PUT',
        endpoint: '/api/phc/support-request',
        statusCode: 404,
        message: `Support requisition #${request_id} not found`,
        responseTimeMs: duration
      });
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404, headers: { 'X-Request-Id': reqId } });
    }

    logApiRequest({
      requestId: reqId,
      method: 'PUT',
      endpoint: '/api/phc/support-request',
      user: officer_id || 'govtjharkhand123',
      role: 'GOVERNMENT_OFFICIAL',
      statusCode: 200,
      message: `Government Command updated requisition #${updated.request_code} to status: ${status}`,
      responseTimeMs: duration,
      requestBody: body
    });

    logAuditEvent({
      action: 'DIRECTIVE_DISPATCH',
      actor: officer_id || 'govtjharkhand123',
      actorRole: 'GOVERNMENT_OFFICIAL',
      targetEntity: 'DIRECTIVE',
      entityId: updated.request_code,
      facilityId: updated.source_facility_id,
      facilityName: updated.source_facility_name,
      details: `State Command action taken on requisition #${updated.request_code}: Status changed to ${status}. Dispatch notes: "${response_notes || 'Approved'}".`,
      status: 'SUCCESS',
      metadata: { request_id, status }
    });

    return NextResponse.json({
      success: true,
      message: 'Government action updated and dispatched to PHC',
      request: updated
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'PUT',
      endpoint: '/api/phc/support-request',
      statusCode: 500,
      message: `Error responding to requisition: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}
