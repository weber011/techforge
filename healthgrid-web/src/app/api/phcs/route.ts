import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const phcs = await prisma.phc.findMany({
      include: {
        district: {
          include: {
            state: true,
          }
        },
        riskScores: {
          orderBy: {
            date: 'desc'
          },
          take: 1
        },
        alerts: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    });

    const formatted = phcs.map((p: any) => ({
      id: p.id,
      name: p.name,
      district: p.district.name,
      state: p.district.state.name,
      type: p.type,
      totalBeds: p.totalBeds,
      latitude: p.latitude,
      longitude: p.longitude,
      riskScore: p.riskScores[0]?.score || 0,
      activeAlertsCount: p.alerts.length
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching PHCs:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch PHCs', error: error.message }, { status: 500 });
  }
}
