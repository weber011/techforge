import { NextResponse } from 'next/server';
import { 
  getPhcLiveState, 
  getAllPhcLiveStates, 
  updatePhcLiveState, 
  updatePhcMedicineStock, 
  addNewMedicineToPhc,
  getPhcUserByEmail
} from '@/lib/phcStore';
import { logApiRequest, logAuditEvent, generateRequestId } from '@/lib/logger';

export async function GET(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-INV');

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
      const duration = performance.now() - startTime;
      
      if (!state) {
        logApiRequest({
          requestId: reqId,
          method: 'GET',
          endpoint: '/api/phc/inventory',
          statusCode: 404,
          message: `Facility inventory not found for ID: ${targetId}`,
          responseTimeMs: duration
        });
        return NextResponse.json({ success: false, error: 'Facility state not found' }, { status: 404, headers: { 'X-Request-Id': reqId } });
      }

      logApiRequest({
        requestId: reqId,
        method: 'GET',
        endpoint: '/api/phc/inventory',
        user: email || targetId,
        role: 'PHC_OFFICER',
        statusCode: 200,
        message: `Fetched live inventory (${state.medicines?.length || 0} drugs, ${state.available_beds} beds available) for ${state.facility_name}`,
        responseTimeMs: duration
      });

      return NextResponse.json({ success: true, state }, { headers: { 'X-Request-Id': reqId } });
    }

    const allStates = getAllPhcLiveStates();
    const duration = performance.now() - startTime;

    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/phc/inventory',
      statusCode: 200,
      message: `Retrieved master telemetry inventory across all ${allStates.length} PHCs`,
      responseTimeMs: duration
    });

    return NextResponse.json({ success: true, facilities: allStates }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/phc/inventory',
      statusCode: 500,
      message: `Error fetching inventory: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}

export async function POST(request: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-INV-MOD');

  try {
    const body = await request.json();
    const { 
      facility_id, 
      action, // 'UPDATE_STOCK' | 'ADD_MEDICINE' | 'UPDATE_OPERATIONAL'
      medicine_id, 
      new_stock, 
      batch_number, 
      expiry_date,
      medicine_data,
      operational_data 
    } = body;

    if (!facility_id) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/inventory',
        statusCode: 400,
        message: 'Validation failed: facility_id is required',
        responseTimeMs: duration,
        requestBody: body
      });
      return NextResponse.json({ success: false, error: 'facility_id is required' }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    if (action === 'UPDATE_STOCK') {
      if (!medicine_id || typeof new_stock !== 'number' || isNaN(new_stock)) {
        const duration = performance.now() - startTime;
        logApiRequest({
          requestId: reqId,
          method: 'POST',
          endpoint: '/api/phc/inventory',
          statusCode: 400,
          message: 'Validation failed: medicine_id and numeric new_stock required',
          responseTimeMs: duration,
          requestBody: body
        });
        return NextResponse.json({ success: false, error: 'medicine_id and numeric new_stock required' }, { status: 400, headers: { 'X-Request-Id': reqId } });
      }

      const updated = updatePhcMedicineStock(facility_id, medicine_id, new_stock, batch_number, expiry_date);
      const updatedMed = updated.medicines.find(m => m.id === medicine_id);
      const duration = performance.now() - startTime;

      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/inventory',
        user: facility_id,
        role: 'PHC_OFFICER',
        statusCode: 200,
        message: `Updated stock of ${updatedMed?.name || medicine_id} to ${new_stock} units at ${updated.facility_name}`,
        responseTimeMs: duration,
        requestBody: body,
        responseSummary: { facility_id, medicine_id, new_stock, status: updatedMed?.status }
      });

      logAuditEvent({
        action: 'INVENTORY_UPDATE',
        actor: facility_id,
        actorRole: 'PHC_OFFICER',
        targetEntity: 'MEDICINE',
        entityId: medicine_id,
        facilityId: facility_id,
        facilityName: updated.facility_name,
        details: `Stock adjustment for ${updatedMed?.name || medicine_id}: new quantity set to ${new_stock} ${updatedMed?.unit || 'units'}. Status: ${updatedMed?.status || 'SAFE'}.`,
        status: 'SUCCESS',
        metadata: { medicine_id, new_stock, batch_number, expiry_date }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Medicine stock updated successfully across HealthGrid portals', 
        state: updated 
      }, { headers: { 'X-Request-Id': reqId } });
    }

    if (action === 'ADD_MEDICINE') {
      if (!medicine_data || !medicine_data.name) {
        const duration = performance.now() - startTime;
        logApiRequest({
          requestId: reqId,
          method: 'POST',
          endpoint: '/api/phc/inventory',
          statusCode: 400,
          message: 'Validation failed: Valid medicine_data is required',
          responseTimeMs: duration,
          requestBody: body
        });
        return NextResponse.json({ success: false, error: 'Valid medicine_data is required' }, { status: 400, headers: { 'X-Request-Id': reqId } });
      }

      const updated = addNewMedicineToPhc(facility_id, medicine_data);
      const duration = performance.now() - startTime;

      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/inventory',
        user: facility_id,
        role: 'PHC_OFFICER',
        statusCode: 200,
        message: `Registered new medicine batch ${medicine_data.name} (${medicine_data.current_stock} ${medicine_data.unit}) at ${updated.facility_name}`,
        responseTimeMs: duration,
        requestBody: body
      });

      logAuditEvent({
        action: 'INVENTORY_UPDATE',
        actor: facility_id,
        actorRole: 'PHC_OFFICER',
        targetEntity: 'MEDICINE',
        entityId: medicine_data.id || 'NEW_MED',
        facilityId: facility_id,
        facilityName: updated.facility_name,
        details: `Registered new drug stock batch: ${medicine_data.name} (Initial stock: ${medicine_data.current_stock} ${medicine_data.unit}, Batch: ${medicine_data.batch_number || 'N/A'}).`,
        status: 'SUCCESS'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'New medicine added to PHC live inventory', 
        state: updated 
      }, { headers: { 'X-Request-Id': reqId } });
    }

    if (action === 'UPDATE_OPERATIONAL') {
      const updated = updatePhcLiveState(facility_id, operational_data || {});
      const duration = performance.now() - startTime;

      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/inventory',
        user: facility_id,
        role: 'PHC_OFFICER',
        statusCode: 200,
        message: `Updated operational metrics for ${updated.facility_name}: Beds ${updated.available_beds}/${updated.total_beds}, Ambulance: ${updated.ambulance_status}`,
        responseTimeMs: duration,
        requestBody: body
      });

      logAuditEvent({
        action: 'INVENTORY_UPDATE',
        actor: facility_id,
        actorRole: 'PHC_OFFICER',
        targetEntity: 'PHC_FACILITY',
        entityId: facility_id,
        facilityId: facility_id,
        facilityName: updated.facility_name,
        details: `Operational state updated: Available Beds: ${updated.available_beds}/${updated.total_beds}, Doctors: ${updated.doctors_present}, Ambulance: ${updated.ambulance_status}, ER: ${updated.emergency_room_status}.`,
        status: 'SUCCESS'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'PHC operational metrics and bed capacity updated', 
        state: updated 
      }, { headers: { 'X-Request-Id': reqId } });
    }

    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/inventory',
      statusCode: 400,
      message: `Invalid action provided: ${action}`,
      responseTimeMs: duration,
      requestBody: body
    });

    return NextResponse.json({ success: false, error: 'Invalid action provided' }, { status: 400, headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/inventory',
      statusCode: 500,
      message: `Server error during inventory modification: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}
