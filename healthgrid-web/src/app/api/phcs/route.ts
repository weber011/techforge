import { NextResponse } from 'next/server';
import { getHealthGridPHCs } from '@/lib/upstash';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const phcs = await getHealthGridPHCs();

    return NextResponse.json({
      success: true,
      data: phcs,
      source: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? 'upstash_redis' : 'seeded_memory'
    });
  } catch (error: any) {
    console.error('Error fetching PHCs:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch PHCs', error: error.message }, { status: 500 });
  }
}
