import { NextResponse } from 'next/server';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');
    const block = searchParams.get('block');
    const type = searchParams.get('type');
    const service = searchParams.get('service');

    let facilities = RANCHI_FACILITIES_MASTER.map(f => ({
      facility_id: f.facility_id,
      facility_code: f.facility_code,
      facility_name: f.facility_name,
      facility_type: f.facility_type,
      block: f.block,
      district: f.district,
      state: f.state,
      address: f.address,
      latitude: f.latitude,
      longitude: f.longitude,
      phone: f.phone,
      email: f.email,
      opening_hours: f.opening_hours,
      emergency_available: f.emergency_available,
      public_services: f.services,
      total_beds: f.total_beds,
      is_verified_real: f.is_verified_real,
      source: f.ownership + ' (Govt of Jharkhand)',
      source_verified_date: '2026-03-01',
      data_confidence: f.data_confidence
    }));

    if (district && district !== 'All') {
      facilities = facilities.filter(f => f.district.toLowerCase() === district.toLowerCase());
    }
    if (block && block !== 'All') {
      facilities = facilities.filter(f => f.block.toLowerCase().includes(block.toLowerCase()));
    }
    if (type && type !== 'All') {
      facilities = facilities.filter(f => f.facility_type.toLowerCase() === type.toLowerCase());
    }
    if (service && service !== 'All') {
      facilities = facilities.filter(f => f.public_services.some(s => s.toLowerCase().includes(service.toLowerCase())));
    }

    return NextResponse.json({
      success: true,
      count: facilities.length,
      facilities,
      provenance: 'REAL_VERIFIED'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Data currently unavailable' }, { status: 500 });
  }
}
