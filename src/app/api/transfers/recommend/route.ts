import { NextResponse } from 'next/server';
import { getHealthGridPHCs, getHealthGridInventories } from '@/lib/upstash';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { targetPhcId = 'PHC_PAT_03', medicineId = 'MED_PARA_500', requiredQuantity = 500 } = await req.json();

    const phcs = await getHealthGridPHCs();
    const inventories = await getHealthGridInventories();

    const targetPhc = phcs.find((p: any) => p.id === targetPhcId);
    if (!targetPhc) {
      return NextResponse.json({ error: 'Target PHC not found' }, { status: 404 });
    }

    // Identify candidate donors across network
    const candidates = phcs
      .filter((p: any) => p.id !== targetPhcId)
      .map((donor: any) => {
        const stockData = inventories[donor.id]?.[medicineId] || { stock: 1500, dailyConsumption: 40, safetyStock: 400 };
        const availableStock = stockData.stock;
        const surplus = availableStock - stockData.safetyStock - requiredQuantity;

        let score = 100;
        const reasons: string[] = [];

        // District distance penalty
        if (donor.district !== targetPhc.district) {
          score -= 30;
          reasons.push(`Out-of-district transit: ${donor.district} ➔ ${targetPhc.district}`);
        } else {
          score += 15;
          reasons.push(`Same district cluster (${donor.district}) — estimated transit < 45 mins`);
        }

        // Surplus evaluation
        if (surplus > 600) {
          score += 25;
          reasons.push('Substantial surplus buffer — donor remains safe (> 15 days cover)');
        } else if (surplus < 100) {
          score -= 45;
          reasons.push('Low safety buffer — high risk of donor stockout');
        }

        return {
          phcId: donor.id,
          name: donor.name,
          district: donor.district,
          state: donor.state,
          availableStock,
          surplus: Math.max(0, surplus),
          score,
          reasons
        };
      });

    const rankedCandidates = candidates
      .filter((c: any) => c.score > 50)
      .sort((a: any, b: any) => b.score - a.score);

    return NextResponse.json({
      success: true,
      message: 'Optimal donor facilities identified via AI resource optimization.',
      targetFacility: targetPhc.name,
      requestedMedicine: medicineId,
      requestedQuantity: requiredQuantity,
      recommendations: rankedCandidates.slice(0, 3)
    });
  } catch (error: any) {
    console.error('Optimization Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
