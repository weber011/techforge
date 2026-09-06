import { NextResponse } from 'next/server';
import { getApiLogs, getAuditLogs, getLoggerStats, clearAllLogs, logAuditEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'api' | 'audit' | 'all'
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100;
    const endpoint = searchParams.get('endpoint') || undefined;
    const action = searchParams.get('action') || undefined;
    const status = searchParams.get('status') || undefined;

    const stats = getLoggerStats();

    if (type === 'api') {
      const api_logs = getApiLogs({ search, limit, endpoint, status });
      return NextResponse.json({ success: true, api_logs, stats });
    }

    if (type === 'audit') {
      const audit_logs = getAuditLogs({ search, limit, action });
      return NextResponse.json({ success: true, audit_logs, stats });
    }

    const api_logs = getApiLogs({ search, limit, endpoint, status });
    const audit_logs = getAuditLogs({ search, limit, action });

    return NextResponse.json({
      success: true,
      stats,
      api_logs,
      audit_logs
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'CLEAR_LOGS') {
      clearAllLogs();
      logAuditEvent({
        action: 'TEST_EXECUTION',
        actor: 'ADMIN_JUDGE_CONSOLE',
        actorRole: 'GOVERNMENT_OFFICIAL',
        targetEntity: 'TEST_SUITE',
        entityId: 'LOG_PURGE',
        details: 'Admin cleared runtime request logs and audit trails for a fresh test run.',
        status: 'SUCCESS'
      });

      return NextResponse.json({
        success: true,
        message: 'All runtime logs reset successfully for fresh test run.'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
