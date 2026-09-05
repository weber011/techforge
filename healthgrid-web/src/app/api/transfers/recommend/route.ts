import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { targetPhcId, medicineId, requiredQuantity } = await req.json();

    // 1. Validate Target PHC needs
    const targetPhc = await prisma.phc.findUnique({
      where: { id: targetPhcId },
      include: { district: true }
    });

    if (!targetPhc) return NextResponse.json({ error: 'Target PHC not found' }, { status: 404 });

    // 2. Search for candidate donors (Optimization Engine Logic)
    // Find PHCs with surplus inventory of the same medicine
    const candidates = await prisma.inventory.findMany({
      where: {
        medicineId: medicineId,
        phcId: { not: targetPhcId },
        // Simple logic for surplus: stock > required + safety buffer
        closingStock: { gt: requiredQuantity + 200 }
      },
      include: {
        phc: { include: { district: true } },
        medicine: true
      }
    });

    // 3. Score and rank candidates
    const scoredCandidates = candidates.map(inventory => {
      let score = 100;
      let reasons = [];

      // Penalty for being in a different district (simulated distance)
      if (inventory.phc.districtId !== targetPhc.districtId) {
        score -= 30;
        reasons.push('Different district (longer transit time)');
      }

      // Reward for high surplus
      const surplus = inventory.closingStock - inventory.medicine.safetyStock - requiredQuantity;
      if (surplus > 500) {
        score += 20;
        reasons.push('High surplus capacity (Safe donor)');
      } else if (surplus < 100) {
        score -= 40;
        reasons.push('Low surplus buffer (Risk of causing secondary shortage)');
      }

      return {
        phcId: inventory.phc.id,
        name: inventory.phc.name,
        district: inventory.phc.district.name,
        availableStock: inventory.closingStock,
        surplus,
        score,
        reasons
      };
    });

    // Sort by highest score first
    const rankedCandidates = scoredCandidates
      .filter(c => c.score > 50) // Reject unsafe donors
      .sort((a, b) => b.score - a.score);

    if (rankedCandidates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No safe donor PHCs found. Consider requesting from State Warehouse.",
        recommendations: []
      });
    }

    return NextResponse.json({
      success: true,
      message: "Optimal donor facilities identified.",
      recommendations: rankedCandidates.slice(0, 3) // Top 3 recommendations
    });

  } catch (error: any) {
    console.error('Optimization Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
