import { NextResponse } from 'next/server';
import { 
  getAllDirectives, 
  getDirectivesForFacility, 
  createGovtDirective, 
  respondToGovtDirective,
  GovtDirective,
  getPhcLiveState
} from '@/lib/phcStore';
import { logApiRequest, logAuditEvent, generateRequestId } from '@/lib/logger';

export async function GET(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-DIR-GET');

  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facility_id');
    const email = searchParams.get('email');

    if (facilityId || email) {
      const directives = getDirectivesForFacility(facilityId || email!);
      const duration = performance.now() - startTime;

      logApiRequest({
        requestId: reqId,
        method: 'GET',
        endpoint: '/api/government/directives',
        user: email || facilityId,
        role: 'PHC_OFFICER',
        statusCode: 200,
        message: `Fetched ${directives.length} directives for ${facilityId || email}`,
        responseTimeMs: duration
      });

      return NextResponse.json({ success: true, directives }, { headers: { 'X-Request-Id': reqId } });
    }

    const all = getAllDirectives();
    const duration = performance.now() - startTime;

    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/government/directives',
      user: 'GOVT_COMMAND',
      role: 'GOVERNMENT_OFFICIAL',
      statusCode: 200,
      message: `Retrieved all ${all.length} active directives across Ranchi health district`,
      responseTimeMs: duration
    });

    return NextResponse.json({ success: true, directives: all }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/government/directives',
      statusCode: 500,
      message: `Error fetching directives: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}

// Government dispatches directive to specific PHC
export async function POST(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-DIR-POST');

  try {
    const body = await request.json();
    const { target_facility_id, priority, title, message, sender_officer_id, sender_role } = body;

    // Security Check: Role validation
    if (sender_role && sender_role !== 'GOVERNMENT_OFFICIAL' && sender_role !== 'ADMIN') {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/government/directives',
        user: sender_officer_id || 'UNAUTHORIZED_ACTOR',
        role: sender_role || 'CITIZEN',
        statusCode: 403,
        message: `Security rejection: Unauthorized role [${sender_role}] attempted to issue government command directives`,
        responseTimeMs: duration,
        requestBody: body
      });

      logAuditEvent({
        action: 'SECURITY_VIOLATION',
        actor: sender_officer_id || 'UNAUTHORIZED_USER',
        actorRole: 'UNAUTHENTICATED',
        targetEntity: 'DIRECTIVE',
        entityId: 'UNAUTHORIZED_ACCESS',
        details: `Access Denied (403): User with role '${sender_role}' attempted to dispatch state command directive without GOVERNMENT_OFFICIAL privileges.`,
        status: 'FAILED',
        metadata: { sender_role, target_facility_id }
      });

      return NextResponse.json({ 
        success: false, 
        error: `Access Denied: Role '${sender_role}' is not authorized to dispatch state-level government directives.` 
      }, { status: 403, headers: { 'X-Request-Id': reqId } });
    }

    // Input Validation
    if (!target_facility_id || !title || !message) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/government/directives',
        statusCode: 400,
        message: 'Validation failed: target_facility_id, title, and message are required',
        responseTimeMs: duration,
        requestBody: body
      });
      return NextResponse.json({ 
        success: false, 
        error: 'target_facility_id, title, and message are required' 
      }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    const directive = createGovtDirective({
      target_facility_id,
      priority: priority || 'URGENT_DIRECTIVE',
      title,
      message,
      sender_officer_id
    });

    const duration = performance.now() - startTime;
    const targetFacility = getPhcLiveState(target_facility_id);

    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/government/directives',
      user: sender_officer_id || 'govtjharkhand123',
      role: 'GOVERNMENT_OFFICIAL',
      statusCode: 200,
      message: `Dispatched Directive #${directive.directive_code} [${directive.priority}] to ${directive.target_facility_name}`,
      responseTimeMs: duration,
      requestBody: body,
      responseSummary: { directive_code: directive.directive_code, target: directive.target_facility_name }
    });

    logAuditEvent({
      action: 'DIRECTIVE_DISPATCH',
      actor: sender_officer_id || 'govtjharkhand123',
      actorRole: 'GOVERNMENT_OFFICIAL',
      targetEntity: 'DIRECTIVE',
      entityId: directive.directive_code,
      facilityId: target_facility_id,
      facilityName: directive.target_facility_name,
      details: `State Directive #${directive.directive_code} [${directive.priority}] issued to ${directive.target_facility_name}: "${directive.title}".`,
      status: 'SUCCESS',
      metadata: { directive_id: directive.id, priority: directive.priority }
    });

    return NextResponse.json({
      success: true,
      message: 'Directive successfully dispatched to target PHC',
      directive
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/government/directives',
      statusCode: 500,
      message: `Error dispatching directive: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}

// PHC responds (Approves or Reports Problem)
export async function PUT(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-DIR-PUT');

  try {
    const body = await request.json();
    const { directive_id, status, response_notes, responded_by } = body;

    if (!directive_id || !status) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'PUT',
        endpoint: '/api/government/directives',
        statusCode: 400,
        message: 'Validation failed: directive_id and status are required',
        responseTimeMs: duration
      });
      return NextResponse.json({ 
        success: false, 
        error: 'directive_id and status (APPROVED_AND_READY or PROBLEM_REPORTED) are required' 
      }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    const updated = respondToGovtDirective({
      directive_id,
      status,
      response_notes: response_notes || '',
      responded_by
    });

    const duration = performance.now() - startTime;

    if (!updated) {
      logApiRequest({
        requestId: reqId,
        method: 'PUT',
        endpoint: '/api/government/directives',
        statusCode: 404,
        message: `Directive #${directive_id} not found`,
        responseTimeMs: duration
      });
      return NextResponse.json({ success: false, error: 'Directive not found' }, { status: 404, headers: { 'X-Request-Id': reqId } });
    }

    const isApprove = status === 'APPROVED_AND_READY';

    logApiRequest({
      requestId: reqId,
      method: 'PUT',
      endpoint: '/api/government/directives',
      user: responded_by || updated.target_email,
      role: 'PHC_OFFICER',
      statusCode: 200,
      message: `PHC ${updated.target_facility_name} responded to Directive #${updated.directive_code}: ${status}`,
      responseTimeMs: duration,
      requestBody: body
    });

    logAuditEvent({
      action: isApprove ? 'TRANSFER_APPROVAL' : 'DIRECTIVE_DISPATCH',
      actor: responded_by || updated.target_email,
      actorRole: 'PHC_OFFICER',
      targetEntity: 'DIRECTIVE',
      entityId: updated.directive_code,
      facilityId: updated.target_facility_id,
      facilityName: updated.target_facility_name,
      details: `PHC ${updated.target_facility_name} ${isApprove ? 'APPROVED & CONFIRMED' : 'REPORTED PROBLEM for'} Directive #${updated.directive_code}. Notes: "${response_notes || 'Confirmed'}".`,
      status: 'SUCCESS',
      metadata: { directive_id, status }
    });

    return NextResponse.json({
      success: true,
      message: status === 'APPROVED_AND_READY' ? 'Order approved and confirmed' : 'Problem reported to Command Center',
      directive: updated
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'PUT',
      endpoint: '/api/government/directives',
      statusCode: 500,
      message: `Error responding to directive: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}
