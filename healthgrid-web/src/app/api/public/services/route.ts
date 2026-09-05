import { NextResponse } from 'next/server';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const serviceSet = new Set<string>();
    RANCHI_FACILITIES_MASTER.forEach(f => {
      f.services.forEach(s => serviceSet.add(s));
    });

    return NextResponse.json({
      success: true,
      services: Array.from(serviceSet).sort(),
      provenance: 'REAL_VERIFIED'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Data currently unavailable' }, { status: 500 });
  }
}
