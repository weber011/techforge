import { NextResponse } from 'next/server';
import { INITIAL_PEER_TRANSFERS, PeerTransferRequest, RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';
import { getPhcUserByEmail, getPhcLiveState } from '@/lib/phcStore';
import { logApiRequest, logAuditEvent, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// In-memory runtime storage for demo transfers (persists throughout session)
let livePeerTransfers: PeerTransferRequest[] = [...INITIAL_PEER_TRANSFERS];
const recentTransferHashes = new Map<string, number>();

export async function GET(req: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-TR-GET');

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'GET',
        endpoint: '/api/phc/transfer-request',
        statusCode: 200,
        message: `Fetched all ${livePeerTransfers.length} peer transfers across Ranchi health network`,
        responseTimeMs: duration
      });
      return NextResponse.json({ success: true, transfers: livePeerTransfers }, { headers: { 'X-Request-Id': reqId } });
    }

    const relevant = livePeerTransfers.filter(
      t => t.source_phc_email.toLowerCase() === email.toLowerCase() || 
           t.destination_phc_email.toLowerCase() === email.toLowerCase()
    );
    const duration = performance.now() - startTime;

    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/phc/transfer-request',
      user: email,
      role: 'PHC_OFFICER',
      statusCode: 200,
      message: `Fetched ${relevant.length} transfers for ${email}`,
      responseTimeMs: duration
    });

    return NextResponse.json({ success: true, transfers: relevant }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'GET',
      endpoint: '/api/phc/transfer-request',
      statusCode: 500,
      message: `Error fetching transfers: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}

export async function POST(req: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-TR-POST');

  try {
    const body = await req.json();
    const {
      source_phc_email,
      destination_phc_email,
      medicine_name = 'Paracetamol 500mg',
      requested_quantity = 500,
      urgency = 'CRITICAL'
    } = body;

    // 1. Validate Input
    if (!source_phc_email || !destination_phc_email) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/transfer-request',
        statusCode: 400,
        message: 'Validation failed: Both sender and recipient PHC email IDs are required',
        responseTimeMs: duration,
        requestBody: body
      });
      return NextResponse.json({ success: false, error: 'Both sender and recipient PHC email IDs are required.' }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    // 2. Duplicate Request Detection (15-second debounce window)
    const requestHash = `${source_phc_email}:${destination_phc_email}:${medicine_name}:${requested_quantity}`;
    const lastTime = recentTransferHashes.get(requestHash);
    const now = Date.now();

    if (lastTime && (now - lastTime) < 15000) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/transfer-request',
        user: source_phc_email,
        role: 'PHC_OFFICER',
        statusCode: 409,
        message: `Duplicate transfer request rejected for ${medicine_name} (${requested_quantity} units) within debounce window`,
        responseTimeMs: duration,
        requestBody: body
      });

      return NextResponse.json({ 
        success: false, 
        error: 'Duplicate request: An identical transfer requisition was dispatched within the last 15 seconds. Please wait before re-submitting.',
        duplicate_detected: true
      }, { status: 409, headers: { 'X-Request-Id': reqId } });
    }
    recentTransferHashes.set(requestHash, now);

    // 3. Resolve Facilities
    const sourceFacility = RANCHI_FACILITIES_MASTER.find(f => f.email.toLowerCase() === source_phc_email.toLowerCase()) || {
      facility_name: source_phc_email.split('@')[0].toUpperCase(),
      district: 'Ranchi',
      latitude: 23.34,
      longitude: 85.31
    };

    const destFacility = RANCHI_FACILITIES_MASTER.find(f => f.email.toLowerCase() === destination_phc_email.toLowerCase()) || {
      facility_name: destination_phc_email.split('@')[0].toUpperCase(),
      district: 'Ranchi',
      latitude: 23.40,
      longitude: 85.19
    };

    // 4. Resolve Donor Live Stock
    const destUser = getPhcUserByEmail(destination_phc_email);
    let donorCurrentStock = 1800;
    let donorSafetyStock = 400;

    if (destUser) {
      const liveState = getPhcLiveState(destUser.facility_id);
      const matchMed = liveState?.medicines.find(m => m.name.toLowerCase().includes(medicine_name.toLowerCase()) || medicine_name.toLowerCase().includes(m.name.toLowerCase()));
      if (matchMed) {
        donorCurrentStock = matchMed.current_stock;
        donorSafetyStock = matchMed.min_safety_stock;
      }
    }

    const qty = Number(requested_quantity);

    // 5. Check if requested quantity strictly exceeds donor's total available stock
    if (qty > donorCurrentStock) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'POST',
        endpoint: '/api/phc/transfer-request',
        user: source_phc_email,
        role: 'PHC_OFFICER',
        statusCode: 400,
        message: `Transfer rejected: Requested quantity (${qty}) exceeds donor's total stock (${donorCurrentStock}) for ${medicine_name}`,
        responseTimeMs: duration,
        requestBody: body
      });

      logAuditEvent({
        action: 'TRANSFER_CREATION',
        actor: source_phc_email,
        actorRole: 'PHC_OFFICER',
        targetEntity: 'TRANSFER_ORDER',
        entityId: 'TR_DEFICIT_REJECT',
        facilityName: sourceFacility.facility_name,
        details: `Peer transfer rejected: ${sourceFacility.facility_name} requested ${qty} units of ${medicine_name}, but donor ${destFacility.facility_name} only holds ${donorCurrentStock} units.`,
        status: 'FAILED',
        metadata: { requested_quantity: qty, available_stock: donorCurrentStock }
      });

      return NextResponse.json({
        success: false,
        error: `Requested transfer quantity (${qty}) exceeds donor's total available stock (${donorCurrentStock} units). Cannot fulfill transfer.`,
        available_stock: donorCurrentStock,
        requested_quantity: qty
      }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    // 6. Donor Safety Assessment Check
    const postTransferStock = donorCurrentStock - qty;
    const isSafe = postTransferStock >= donorSafetyStock;

    const newTransfer: PeerTransferRequest = {
      id: `TR-RNC-${Date.now().toString().slice(-6)}`,
      timestamp: 'Just now',
      source_phc_email,
      source_phc_name: sourceFacility.facility_name,
      destination_phc_email,
      destination_phc_name: destFacility.facility_name,
      medicine_id: 'MED-001',
      medicine_name,
      requested_quantity: qty,
      urgency,
      status: 'PENDING_APPROVAL',
      donor_safety_check: {
        donor_current_stock: donorCurrentStock,
        donor_post_transfer_stock: postTransferStock,
        donor_safety_stock: donorSafetyStock,
        is_safe: isSafe,
      },
      distance_km: 14.5
    };

    livePeerTransfers = [newTransfer, ...livePeerTransfers];
    const duration = performance.now() - startTime;

    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/transfer-request',
      user: source_phc_email,
      role: 'PHC_OFFICER',
      statusCode: 200,
      message: `Created transfer ${newTransfer.id}: ${qty}x ${medicine_name} from ${destFacility.facility_name} to ${sourceFacility.facility_name}. Safety: ${isSafe ? 'PASS' : 'WARN_LOW_BUFFER'}`,
      responseTimeMs: duration,
      requestBody: body,
      responseSummary: { transfer_id: newTransfer.id, is_safe: isSafe }
    });

    logAuditEvent({
      action: 'TRANSFER_CREATION',
      actor: source_phc_email,
      actorRole: 'PHC_OFFICER',
      targetEntity: 'TRANSFER_ORDER',
      entityId: newTransfer.id,
      facilityName: sourceFacility.facility_name,
      details: `Created peer medicine transfer request #${newTransfer.id} for ${qty} units of ${medicine_name} from ${destFacility.facility_name}. Donor safety verified: ${isSafe ? 'SAFE' : 'SECONDARY_BUFFER_WARNING'}.`,
      status: 'SUCCESS',
      metadata: { transfer_id: newTransfer.id, is_safe: isSafe, postTransferStock }
    });

    return NextResponse.json({
      success: true,
      message: `Emergency peer request dispatched directly from ${source_phc_email} to ${destination_phc_email}`,
      transfer: newTransfer,
      donor_safety_assessment: isSafe 
        ? '✓ SAFE DONOR: Recipient PHC can safely dispatch without causing secondary shortage.'
        : '⚠ DONOR WARNING: Request exceeds safe buffer capacity.'
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'POST',
      endpoint: '/api/phc/transfer-request',
      statusCode: 500,
      message: `Error creating transfer: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}

export async function PUT(req: Request) {
  const startTime = performance.now();
  const reqId = generateRequestId('REQ-TR-ACTION');

  try {
    const body = await req.json();
    const { transfer_id, action, officer_notes } = body; // action: 'APPROVE' | 'REJECT'

    if (!transfer_id || !action) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'PUT',
        endpoint: '/api/phc/transfer-request',
        statusCode: 400,
        message: 'Validation failed: transfer_id and action (APPROVE/REJECT) are required',
        responseTimeMs: duration
      });
      return NextResponse.json({ success: false, error: 'transfer_id and action are required' }, { status: 400, headers: { 'X-Request-Id': reqId } });
    }

    const index = livePeerTransfers.findIndex(t => t.id === transfer_id);
    if (index === -1) {
      const duration = performance.now() - startTime;
      logApiRequest({
        requestId: reqId,
        method: 'PUT',
        endpoint: '/api/phc/transfer-request',
        statusCode: 404,
        message: `Transfer #${transfer_id} not found`,
        responseTimeMs: duration
      });
      return NextResponse.json({ success: false, error: 'Transfer order not found' }, { status: 404, headers: { 'X-Request-Id': reqId } });
    }

    const isApprove = action.toUpperCase() === 'APPROVE';
    const newStatus = isApprove ? 'DISPATCHED_IN_TRANSIT' : 'REJECTED';
    livePeerTransfers[index] = {
      ...livePeerTransfers[index],
      status: newStatus as any
    };

    const targetTransfer = livePeerTransfers[index];
    const duration = performance.now() - startTime;

    logApiRequest({
      requestId: reqId,
      method: 'PUT',
      endpoint: '/api/phc/transfer-request',
      user: targetTransfer.destination_phc_email,
      role: 'PHC_OFFICER',
      statusCode: 200,
      message: `Transfer #${transfer_id} ${isApprove ? 'APPROVED & DISPATCHED' : 'REJECTED'} by donor ${targetTransfer.destination_phc_name}`,
      responseTimeMs: duration,
      requestBody: body
    });

    logAuditEvent({
      action: isApprove ? 'TRANSFER_APPROVAL' : 'TRANSFER_REJECTION',
      actor: targetTransfer.destination_phc_email,
      actorRole: 'PHC_OFFICER',
      targetEntity: 'TRANSFER_ORDER',
      entityId: transfer_id,
      facilityName: targetTransfer.destination_phc_name,
      details: `Transfer order #${transfer_id} (${targetTransfer.requested_quantity}x ${targetTransfer.medicine_name}) was ${isApprove ? 'APPROVED and DISPATCHED to ' + targetTransfer.source_phc_name : 'REJECTED due to operational constraints'}. Notes: ${officer_notes || 'N/A'}.`,
      status: 'SUCCESS',
      metadata: { transfer_id, status: newStatus, action }
    });

    return NextResponse.json({
      success: true,
      message: `Transfer order #${transfer_id} successfully ${isApprove ? 'approved and dispatched' : 'rejected'}.`,
      transfer: targetTransfer
    }, { headers: { 'X-Request-Id': reqId } });
  } catch (error: any) {
    const duration = performance.now() - startTime;
    logApiRequest({
      requestId: reqId,
      method: 'PUT',
      endpoint: '/api/phc/transfer-request',
      statusCode: 500,
      message: `Error updating transfer order: ${error.message}`,
      responseTimeMs: duration
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: { 'X-Request-Id': reqId } });
  }
}
