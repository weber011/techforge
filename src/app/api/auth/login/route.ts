import { NextResponse } from 'next/server';
import { logApiRequest, logAuditEvent, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-AUTH');

  try {
    const body = await req.json();
    const { email, password, role } = body;

    // Government Login
    if (email === 'govtjharkhand123' && password === 'aman123') {
      const duration = performance.now() - startTime;

      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/auth/login',
        user: 'govtjharkhand123',
        role: 'GOVERNMENT_OFFICIAL',
        statusCode: 200,
        message: 'Government Command Center session authenticated successfully',
        responseTimeMs: duration,
        requestBody: body,
        responseSummary: { role: 'GOVERNMENT_OFFICIAL' }
      });

      logAuditEvent({
        action: 'LOGIN',
        actor: 'govtjharkhand123',
        actorRole: 'GOVERNMENT_OFFICIAL',
        targetEntity: 'AUTH_SESSION',
        entityId: 'GOVT-RNC-HQ',
        facilityId: 'GOVT-RNC-HQ',
        facilityName: 'State Health Command Center Ranchi',
        details: 'Command Center Officer authenticated into State Outbreak Radar & Telemetry.',
        status: 'SUCCESS'
      });

      const response = NextResponse.json({
        success: true,
        message: 'Government Command Center session authenticated',
        user: {
          id: 'usr-govt-01',
          name: 'Command Center Officer',
          email: 'govtjharkhand123',
          role: 'GOVERNMENT_OFFICIAL'
        }
      }, { headers: { 'X-Request-Id': reqId } });

      response.cookies.set('jh_session', 'govt_auth_token_xyz', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      return response;
    }

    // Citizen Login
    if (role === 'CITIZEN' || (email && email.includes('@'))) {
      const duration = performance.now() - startTime;

      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/auth/login',
        user: email || 'Verified Citizen',
        role: 'CITIZEN',
        statusCode: 200,
        message: `Citizen session authenticated for ${email}`,
        responseTimeMs: duration,
        requestBody: body
      });

      logAuditEvent({
        action: 'LOGIN',
        actor: email,
        actorRole: 'CITIZEN',
        targetEntity: 'AUTH_SESSION',
        entityId: 'CITIZEN-PORTAL',
        details: `Citizen user (${email}) logged into Public Health Portal.`,
        status: 'SUCCESS'
      });

      const response = NextResponse.json({
        success: true,
        message: 'Citizen authenticated',
        user: {
          id: 'usr-citizen-' + Date.now(),
          name: email.split('@')[0] || 'Verified Citizen',
          email,
          role: 'CITIZEN'
        }
      }, { headers: { 'X-Request-Id': reqId } });

      response.cookies.set('jh_session', 'citizen_token_' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      return response;
    }

    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/auth/login',
      user: email || 'UNKNOWN',
      role: 'UNAUTHENTICATED',
      statusCode: 401,
      message: `Failed login attempt for identifier '${email}': Invalid credentials`,
      responseTimeMs: duration,
      requestBody: body
    });

    logAuditEvent({
      action: 'LOGIN',
      actor: email || 'UNKNOWN_ACTOR',
      actorRole: 'UNAUTHENTICATED',
      targetEntity: 'AUTH_SESSION',
      entityId: email || 'FAILED_AUTH',
      details: `Failed authentication attempt for ${email} with invalid credentials.`,
      status: 'FAILED'
    });

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401, headers: { 'X-Request-Id': reqId } });
  } catch (err: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/auth/login',
      statusCode: 500,
      message: `Authentication exception: ${err.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}
