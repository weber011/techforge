import { NextResponse } from 'next/server';
import { 
  getAllPhcGovtRequests, 
  getPhcGovtRequestsForFacility, 
  createPhcGovtRequest, 
  respondToPhcGovtRequest,
  PhcGovtRequest 
} from '@/lib/phcStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facility_id');
    const email = searchParams.get('email');

    if (facilityId || email) {
      const requests = getPhcGovtRequestsForFacility(facilityId || email!);
      return NextResponse.json({ success: true, requests });
    }

    const all = getAllPhcGovtRequests();
    return NextResponse.json({ success: true, requests: all });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// PHC creates a request to Government
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source_facility_id, category, urgency, title, description, requested_by_officer } = body;

    if (!source_facility_id || !title || !description) {
      return NextResponse.json({ 
        success: false, 
        error: 'source_facility_id, title, and description are required' 
      }, { status: 400 });
    }

    const newReq = createPhcGovtRequest({
      source_facility_id,
      category: category || 'GENERAL_SUPPORT',
      urgency: urgency || 'CRITICAL_URGENT',
      title,
      description,
      requested_by_officer
    });

    return NextResponse.json({
      success: true,
      message: 'Support request escalated to State Health Command Center',
      request: newReq
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// Government responds or dispatches support to PHC
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { request_id, status, response_notes, officer_id } = body;

    if (!request_id || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'request_id and status are required' 
      }, { status: 400 });
    }

    const updated = respondToPhcGovtRequest({
      request_id,
      status,
      response_notes: response_notes || '',
      officer_id
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Government action updated and dispatched to PHC',
      request: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
