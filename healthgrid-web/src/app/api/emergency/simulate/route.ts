import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { patientDemandIncrease, medicineDemandIncrease, phcUnavailable } = await req.json();

    // 1. Fetch current network baseline
    const phcs = await prisma.phc.findMany({
      include: {
        inventories: {
          orderBy: { date: 'desc' },
          take: 1
        },
        patientFootfalls: {
          orderBy: { date: 'desc' },
          take: 1
        },
        bedOccupancies: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    // 2. Run simulation calculations
    const simulationResults = phcs.map((phc) => {
      let simulatedRisk = 0;
      let cascadeEffects = [];

      // Base metrics
      let currentPatients = phc.patientFootfalls[0]?.totalPatients || 100;
      let currentBedOccupancy = phc.bedOccupancies[0]?.occupiedBeds || 10;
      let totalBeds = phc.bedOccupancies[0]?.totalBeds || 20;

      // Apply multipliers
      let simPatients = currentPatients * (1 + (patientDemandIncrease / 100));
      
      // Cascade effect logic (If a nearby PHC is closed, patients migrate here)
      if (phcUnavailable && phcUnavailable !== phc.id) {
        // Simplified distance check: assume some migration
        simPatients += currentPatients * 0.15; // 15% spillover
        cascadeEffects.push(`15% patient spillover from closed facility (${phcUnavailable})`);
      }

      // Calculate new bed pressure
      let simBedsNeeded = currentBedOccupancy * (simPatients / currentPatients);
      let bedPressure = simBedsNeeded / totalBeds;
      
      if (bedPressure > 0.85) {
        simulatedRisk += 40;
        cascadeEffects.push(`Bed capacity exceeded (Projected: ${Math.round(simBedsNeeded)} / ${totalBeds})`);
      }

      // Medicine logic
      let medicineStock = phc.inventories[0]?.closingStock || 500;
      let baseConsumption = phc.inventories[0]?.consumed || 50;
      let simConsumption = baseConsumption * (1 + (medicineDemandIncrease / 100)) * (simPatients / currentPatients);
      let simDaysRemaining = medicineStock / simConsumption;

      if (simDaysRemaining < 3) {
        simulatedRisk += 50;
        cascadeEffects.push(`Critical medicine shortage projected (Cover: ${simDaysRemaining.toFixed(1)} days)`);
      } else if (simDaysRemaining < 7) {
        simulatedRisk += 25;
      }

      // Cap risk at 100
      simulatedRisk = Math.min(100, simulatedRisk);
      let status = simulatedRisk > 80 ? 'CRITICAL' : simulatedRisk > 50 ? 'HIGH' : simulatedRisk > 20 ? 'WATCH' : 'STABLE';

      return {
        phcId: phc.id,
        name: phc.name,
        simulatedRisk,
        status,
        projectedPatients: Math.round(simPatients),
        projectedBedOccupancy: Math.round((simBedsNeeded / totalBeds) * 100),
        cascadeEffects
      };
    });

    // 3. Filter for impacted PHCs and sort by severity
    const impacted = simulationResults
      .filter(r => r.cascadeEffects.length > 0 || r.status === 'CRITICAL' || r.status === 'HIGH')
      .sort((a, b) => b.simulatedRisk - a.simulatedRisk);

    // 4. Generate AI Recommendations based on the digital twin state
    const recommendations = [];
    if (impacted.length > 0) {
      recommendations.push("Activate Emergency State Logistics Protocol for District.");
      recommendations.push("Authorize inter-district medicine transfers prioritizing CRITICAL facilities.");
      if (impacted.some(i => i.projectedBedOccupancy > 100)) {
        recommendations.push("Deploy mobile medical units and temporary beds to relieve bed pressure.");
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
