import { NextResponse } from 'next/server';
import { 
  getPhcLiveState, 
  getAllPhcLiveStates, 
  updatePhcLiveState, 
  updatePhcMedicineStock, 
  addNewMedicineToPhc,
  getPhcUserByEmail
} from '@/lib/phcStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facility_id');
    const email = searchParams.get('email');

    let targetId = facilityId;
    if (!targetId && email) {
      const user = getPhcUserByEmail(email);
      targetId = user?.facility_id;
    }

    if (targetId) {
      const state = getPhcLiveState(targetId);
      if (!state) {
        return NextResponse.json({ success: false, error: 'Facility state not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, state });
    }

    const allStates = getAllPhcLiveStates();
    return NextResponse.json({ success: true, facilities: allStates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      facility_id, 
      action,
      medicine_id, 
      new_stock, 
      batch_number, 
      expiry_date,
      medicine_data,
      operational_data 
    } = body;

    if (!facility_id) {
      return NextResponse.json({ success: false, error: 'facility_id is required' }, { status: 400 });
    }

    if (action === 'UPDATE_STOCK') {
      if (!medicine_id || typeof new_stock !== 'number') {
        return NextResponse.json({ success: false, error: 'medicine_id and numeric new_stock required' }, { status: 400 });
      }
      const updated = updatePhcMedicineStock(facility_id, medicine_id, new_stock, batch_number, expiry_date);
      return NextResponse.json({ 
        success: true, 
        message: 'Medicine stock updated successfully across HealthGrid portals', 
        state: updated 
      });
    }

    if (action === 'ADD_MEDICINE') {
      if (!medicine_data || !medicine_data.name) {
        return NextResponse.json({ success: false, error: 'Valid medicine_data is required' }, { status: 400 });
      }
      const updated = addNewMedicineToPhc(facility_id, medicine_data);
      return NextResponse.json({ 
        success: true, 
        message: 'New medicine added to PHC live inventory', 
        state: updated 
      });
    }

    if (action === 'UPDATE_OPERATIONAL') {
      const updated = updatePhcLiveState(facility_id, operational_data || {});
      return NextResponse.json({ 
        success: true, 
        message: 'PHC operational metrics and bed capacity updated', 
        state: updated 
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
