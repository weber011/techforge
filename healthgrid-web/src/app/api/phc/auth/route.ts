import { NextResponse } from 'next/server';
import { authenticatePhcUser, PHC_CREDENTIALS_MASTER } from '@/lib/phcStore';
import { logApiRequest, logAuditEvent, generateRequestId } from '@/lib/logger';

export async function POST(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-AUTH');

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/auth',
        user: email || 'UNKNOWN',
        role: 'PHC_OFFICER',
        statusCode: 400,
        message: 'Authentication rejected: Missing email or password',
        responseTimeMs: duration,
        requestBody: body
      });

      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400, headers: { 'X-Request-Id': reqId } }
      );
    }

    const user = authenticatePhcUser(email, password);

    if (!user) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/auth',
        user: email,
        role: 'PHC_OFFICER',
        statusCode: 401,
        message: `Failed authentication attempt for ${email}: Invalid credentials`,
        responseTimeMs: duration,
        requestBody: body
      });

      logAuditEvent({
        action: 'LOGIN',
        actor: email,
        actorRole: 'UNAUTHENTICATED',
        targetEntity: 'AUTH_SESSION',
        entityId: email,
        details: `Failed PHC login attempt for ${email} with invalid password.`,
        status: 'FAILED'
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'अमान्य PHC ईमेल या पासवर्ड (Invalid PHC Email or Password)' 
        },
        { status: 401, headers: { 'X-Request-Id': reqId } }
      );
    }

    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/auth',
      user: user.email,
      role: 'PHC_OFFICER',
      statusCode: 200,
      message: `PHC Medical Officer ${user.medical_officer_in_charge} authenticated successfully for ${user.facility_name}`,
      responseTimeMs: duration,
      requestBody: body,
      responseSummary: { facility_id: user.facility_id, block: user.block }
    });

    logAuditEvent({
      action: 'LOGIN',
      actor: user.email,
      actorRole: 'PHC_OFFICER',
      targetEntity: 'AUTH_SESSION',
      entityId: user.facility_id,
      facilityId: user.facility_id,
      facilityName: user.facility_name,
      details: `Medical Officer ${user.medical_officer_in_charge} logged into ${user.facility_name} (Block: ${user.block}).`,
      status: 'SUCCESS'
    });

    return NextResponse.json({
      success: true,
      message: 'PHC Staff Authenticated Successfully',
      user: {
        facility_id: user.facility_id,
        facility_name: user.facility_name,
        facility_type: user.facility_type,
        block: user.block,
        email: user.email,
        alias_email: user.alias_email,
        phone: user.phone,
        medical_officer_in_charge: user.medical_officer_in_charge
      }
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/auth',
      statusCode: 500,
      message: `Internal server error during PHC authentication: ${error.message}`,
      responseTimeMs: duration
    });

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: { 'X-Request-Id': reqId } }
    );
  }
}

export async function GET() {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-DIR');

  const duration = performance.now() - startTime;
  logApiRequest({
    requestId: reqId,
    method: 'GET',
    endpoint: '/api/phc/auth',
    user: 'PUBLIC',
    role: 'CITIZEN',
    statusCode: 200,
    message: `Retrieved ${PHC_CREDENTIALS_MASTER.length} verified PHC directory entries`,
    responseTimeMs: duration
  });

  return NextResponse.json({
    success: true,
    total_phcs: PHC_CREDENTIALS_MASTER.length,
    facilities_directory: PHC_CREDENTIALS_MASTER.map(u => ({
      facility_id: u.facility_id,
      facility_name: u.facility_name,
      block: u.block,
      email: u.email,
      officer: u.medical_officer_in_charge
    }))
  }, { headers: { 'X-Request-Id': reqId } });
}
