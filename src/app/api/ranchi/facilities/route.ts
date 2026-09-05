import { NextResponse } from 'next/server';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      district: 'Ranchi',
      state: 'Jharkhand',
      total_facilities: RANCHI_FACILITIES_MASTER.length,
      data: RANCHI_FACILITIES_MASTER,
      data_provenance: {
        facility_identities: 'REAL_VERIFIED (Govt of Jharkhand Health Directory)',
        operational_metrics: 'SIMULATED (Prototype Telemetry Feeds)',
        risk_predictions: 'AI_GENERATED (HealthGrid ML Engine v1.2)'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
