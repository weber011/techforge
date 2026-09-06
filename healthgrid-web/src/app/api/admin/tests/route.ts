import { NextResponse } from 'next/server';
import { TEST_CASES_CATALOG, executeTestSuite, getLastSuiteResults } from '@/lib/testRunner';
import { logAuditEvent } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get('test_id');

    const catalog = TEST_CASES_CATALOG.map(tc => ({
      id: tc.id,
      name: tc.name,
      category: tc.category,
      description: tc.description,
      endpoint: tc.endpoint,
      method: tc.method,
      inputPayload: tc.inputPayload,
      expectedStatusCode: tc.expectedStatusCode,
      expectedOutcome: tc.expectedOutcome
    }));

    const lastResults = getLastSuiteResults();

    return NextResponse.json({
      success: true,
      total_tests_available: catalog.length,
      test_catalog: catalog,
      last_execution_summary: lastResults
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { test_id } = body;

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const summary = await executeTestSuite({
      testId: test_id,
      baseUrl
    });

    logAuditEvent({
      action: 'TEST_EXECUTION',
      actor: 'JUDGE_TEST_RUNNER',
      actorRole: 'GOVERNMENT_OFFICIAL',
      targetEntity: 'TEST_SUITE',
      entityId: test_id || 'FULL_SUITE',
      details: `Executed automated test suite [${test_id ? 'Single: ' + test_id : 'All 11 Tests'}]: ${summary.passedTests}/${summary.totalTests} PASSED (${summary.passRatePercentage}%). Avg latency: ${summary.averageResponseTimeMs}ms.`,
      status: summary.failedTests === 0 ? 'SUCCESS' : 'FAILED',
      metadata: {
        total: summary.totalTests,
        passed: summary.passedTests,
        failed: summary.failedTests,
        passRate: summary.passRatePercentage
      }
    });

    return NextResponse.json({
      success: true,
      message: `Automated test run completed: ${summary.passedTests}/${summary.totalTests} tests passed.`,
      summary
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
