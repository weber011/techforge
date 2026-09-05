import { NextResponse } from 'next/server';
import { getHealthGridPHCs, getHealthGridInventories } from '@/lib/upstash';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { patientDemandIncrease = 0, medicineDemandIncrease = 0, phcUnavailable = '' } = await req.json();

    // 1. Fetch current network baseline from Upstash / Memory
    const phcs = await getHealthGridPHCs();
    const inventories = await getHealthGridInventories();

    // 2. Run Digital Twin simulation calculations
    const simulationResults = phcs.map((phc: any) => {
      let simulatedRisk = phc.riskScore || 20;
      const cascadeEffects: string[] = [];

      let currentPatients = 120;
      let totalBeds = phc.totalBeds || 30;
      let currentBedOccupancy = Math.round(totalBeds * 0.7);

      // Apply multipliers
      let simPatients = currentPatients * (1 + (patientDemandIncrease / 100));

      // Cascade effect logic (If an adjacent PHC is closed, patients migrate here)
      if (phcUnavailable && phcUnavailable !== phc.id) {
        simPatients += currentPatients * 0.20; // 20% patient spillover
        cascadeEffects.push(`20% patient spillover from offline facility (${phcUnavailable})`);
      }

      // Calculate new bed pressure
      const simBedsNeeded = currentBedOccupancy * (simPatients / currentPatients);
      const bedPressure = simBedsNeeded / totalBeds;

      if (bedPressure > 0.85) {
        simulatedRisk += 35;
        cascadeEffects.push(`Bed capacity critical (Projected: ${Math.round(simBedsNeeded)} / ${totalBeds} beds)`);
      }

      // Medicine stock assessment
      const phcStock = inventories[phc.id]?.['MED_PARA_500']?.stock || 500;
      const baseConsumption = inventories[phc.id]?.['MED_PARA_500']?.dailyConsumption || 50;
      const simConsumption = baseConsumption * (1 + (medicineDemandIncrease / 100)) * (simPatients / currentPatients);
      const simDaysRemaining = simConsumption > 0 ? phcStock / simConsumption : 999;

      if (simDaysRemaining < 3) {
        simulatedRisk += 45;
        cascadeEffects.push(`Critical medicine stock-out projected (Cover: ${simDaysRemaining.toFixed(1)} days)`);
      } else if (simDaysRemaining < 7) {
        simulatedRisk += 20;
      }

      // Clamp risk score to 100
      simulatedRisk = Math.min(100, Math.round(simulatedRisk));
      const status = simulatedRisk > 80 ? 'CRITICAL' : simulatedRisk > 50 ? 'HIGH' : simulatedRisk > 25 ? 'WATCH' : 'STABLE';

      return {
        phcId: phc.id,
        name: phc.name,
        district: phc.district,
        state: phc.state,
        simulatedRisk,
        status,
        projectedPatients: Math.round(simPatients),
        projectedBedOccupancy: Math.min(100, Math.round((simBedsNeeded / totalBeds) * 100)),
        cascadeEffects
      };
    });

    // Filter for impacted PHCs and sort by risk
    const impacted = simulationResults
      .filter((r: any) => r.cascadeEffects.length > 0 || r.status === 'CRITICAL' || r.status === 'HIGH')
      .sort((a: any, b: any) => b.simulatedRisk - a.simulatedRisk);

    const recommendations: string[] = [];
    if (impacted.length > 0) {
      recommendations.push("Activate State Healthcare Reserve Protocol for affected district clusters.");
      recommendations.push("Authorize automated inter-district medicine redistribution prioritizing CRITICAL nodes.");
      if (impacted.some((i: any) => i.projectedBedOccupancy >= 90)) {
        recommendations.push("Deploy mobile surge units and temporary bed partitions to prevent admission bottlenecks.");
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        impactedFacilities: impacted.length,
        networkStatus: impacted.length > 5 ? 'SEVERE_STRESS' : 'MODERATE_STRESS',
        facilityDetails: impacted,
        recommendations
      }
    });
  } catch (error: any) {
    console.error('Simulation Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
