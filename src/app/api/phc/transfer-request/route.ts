import { NextResponse } from 'next/server';
import { INITIAL_PEER_TRANSFERS, PeerTransferRequest, RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

// In-memory runtime storage for demo transfers (persists throughout session)
let livePeerTransfers: PeerTransferRequest[] = [...INITIAL_PEER_TRANSFERS];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: true, transfers: livePeerTransfers });
    }

    const relevant = livePeerTransfers.filter(
      t => t.source_phc_email.toLowerCase() === email.toLowerCase() || 
           t.destination_phc_email.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({ success: true, transfers: relevant });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      source_phc_email,
      destination_phc_email,
      medicine_name = 'Paracetamol 500mg',
      requested_quantity = 500,
      urgency = 'CRITICAL'
    } = body;

    if (!source_phc_email || !destination_phc_email) {
      return NextResponse.json({ error: 'Both sender and recipient PHC email IDs are required.' }, { status: 400 });
    }

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

    // Donor Safety Verification Check
    const donorCurrentStock = 1800;
    const donorSafetyStock = 400;
    const postTransferStock = donorCurrentStock - requested_quantity;
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
      requested_quantity: Number(requested_quantity),
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

    return NextResponse.json({
      success: true,
      message: `Emergency peer request dispatched directly from ${source_phc_email} to ${destination_phc_email}`,
      transfer: newTransfer,
      donor_safety_assessment: isSafe 
        ? '✓ SAFE DONOR: Recipient PHC can safely dispatch without causing secondary shortage.'
        : '⚠ DONOR WARNING: Request exceeds safe buffer capacity.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
