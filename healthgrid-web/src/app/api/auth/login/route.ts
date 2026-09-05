import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (email === 'govtjharkhand123' && password === 'aman123') {
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'usr-govt-01',
          name: 'Command Center Officer',
          email: 'govtjharkhand123',
          role: 'GOVERNMENT_OFFICIAL'
        }
      });
      response.cookies.set('jh_session', 'govt_auth_token_xyz', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      return response;
    }

    if (role === 'CITIZEN' || (email && email.includes('@'))) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'usr-citizen-' + Date.now(),
          name: email.split('@')[0] || 'Verified Citizen',
          email,
          role: 'CITIZEN'
        }
      });
      response.cookies.set('jh_session', 'citizen_token_' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
