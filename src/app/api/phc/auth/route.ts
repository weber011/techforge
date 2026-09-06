import { NextResponse } from 'next/server';
import { authenticatePhcUser, PHC_CREDENTIALS_MASTER } from '@/lib/phcStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = authenticatePhcUser(email, password);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'अमान्य PHC ईमेल या पासवर्ड (Invalid PHC Email or Password)' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'PHC Staff Authenticated Successfully',
      user: {
        facility_id: user.facility_id,
        facility_name: user.facility_name,
        facility_type: user.facility_type,
        block: user.block,
        email: user.email,
        alias_email: user.alias_email,
        phone: user.phone,
        medical_officer_in_charge: user.medical_officer_in_charge
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    total_phcs: PHC_CREDENTIALS_MASTER.length,
    credentials_directory: PHC_CREDENTIALS_MASTER.map(u => ({
      facility_id: u.facility_id,
      facility_name: u.facility_name,
      block: u.block,
      email: u.email,
      password: u.password,
      officer: u.medical_officer_in_charge
    }))
  });
}
