import { NextResponse } from 'next/server';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').toLowerCase().trim();
    const service = (searchParams.get('service') || '').toLowerCase().trim();

    let results = RANCHI_FACILITIES_MASTER.map(f => ({
      facility_id: f.facility_id,
      facility_name: f.facility_name,
      facility_type: f.facility_type,
      block: f.block,
      district: f.district,
      address: f.address,
      phone: f.phone,
      opening_hours: f.opening_hours,
      emergency_available: f.emergency_available,
      public_services: f.services,
      latitude: f.latitude,
      longitude: f.longitude,
      total_beds: f.total_beds,
      is_verified_real: true
    }));

    if (q) {
      results = results.filter(f => 
        f.facility_name.toLowerCase().includes(q) ||
        f.block.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.facility_type.toLowerCase().includes(q) ||
        f.public_services.some(s => s.toLowerCase().includes(q))
      );
    }

    if (service && service !== 'all') {
      results = results.filter(f => f.public_services.some(s => s.toLowerCase().includes(service)));
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Data currently unavailable' }, { status: 500 });
  }
}
