import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  if (cookie.includes('jh_session')) {
    return NextResponse.json({
      authenticated: true,
      user: {
        role: cookie.includes('govt') ? 'GOVERNMENT_OFFICIAL' : 'CITIZEN',
        name: 'Authenticated User'
      }
    });
  }
  return NextResponse.json({ authenticated: false });
}
