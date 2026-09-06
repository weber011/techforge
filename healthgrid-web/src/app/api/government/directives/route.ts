import { NextResponse } from 'next/server';
import { 
  getAllDirectives, 
  getDirectivesForFacility, 
  createGovtDirective, 
  respondToGovtDirective,
  GovtDirective 
} from '@/lib/phcStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facility_id');
    const email = searchParams.get('email');

    if (facilityId || email) {
      const directives = getDirectivesForFacility(facilityId || email!);
      return NextResponse.json({ success: true, directives });
    }

    const all = getAllDirectives();
    return NextResponse.json({ success: true, directives: all });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// Government dispatches directive to specific PHC
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { target_facility_id, priority, title, message, sender_officer_id } = body;

    if (!target_facility_id || !title || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'target_facility_id, title, and message are required' 
      }, { status: 400 });
    }

    const directive = createGovtDirective({
      target_facility_id,
      priority: priority || 'URGENT_DIRECTIVE',
      title,
      message,
      sender_officer_id
    });

    return NextResponse.json({
      success: true,
      message: 'Directive successfully dispatched to target PHC',
      directive
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// PHC responds (Approves or Reports Problem)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { directive_id, status, response_notes, responded_by } = body;

    if (!directive_id || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'directive_id and status (APPROVED_AND_READY or PROBLEM_REPORTED) are required' 
      }, { status: 400 });
    }

    const updated = respondToGovtDirective({
      directive_id,
      status,
      response_notes: response_notes || '',
      responded_by
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Directive not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'APPROVED_AND_READY' ? 'Order approved and confirmed' : 'Problem reported to Command Center',
      directive: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
