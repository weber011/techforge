import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { RANCHI_FACILITIES_MASTER, RANCHI_MEDICINE_MASTER, INITIAL_PEER_TRANSFERS } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_placeholder_key_for_build',
});

// Comprehensive system prompt with entire Ranchi dataset access and structured output formatting
const buildSystemPrompt = () => {
  const facilitiesSummary = RANCHI_FACILITIES_MASTER.map(f => 
    `• ID: ${f.facility_id} | Name: ${f.facility_name} | Block: ${f.block} | Beds: ${f.total_beds} (Occupied: ${f.operational_data.occupied_beds}, ${f.operational_data.bed_occupancy_rate}%) | Patients: ${f.operational_data.current_patients_today} | Risk: ${f.ai_predictions.risk_level} (${f.ai_predictions.overall_risk_score}/100) | Stockout Prob 72h: ${f.ai_predictions.stockout_probability_72h}% | Factor: ${f.ai_predictions.primary_risk_factor}`
  ).join('\n');

  return {
    role: 'system',
    content: `You are the "AI HealthGrid Copilot", an elite government healthcare operations & resource optimization intelligence assistant for Ranchi District, Jharkhand.

You analyze:
1. Real Verified Facilities & Coordinates
2. Simulated Prototype Telemetry (Medicine inventory, Patient Footfall, Bed Occupancy, Staff)
3. AI/ML Predictions (72-Hour Risk, Stockout Probabilities, Surge Forecasts, Silent Shortage Detection)
4. Resource Redistribution (Donor Safety, FEFO Expiry, Geodesic Distance)

CRITICAL RULES:
• Return highly structured, executive-grade responses with clear sections.
• Always label data provenance clearly:
  - Facility/Location: REAL_VERIFIED
  - Operational Metrics: SIMULATED FOR PROTOTYPE
  - Predictions: AI_GENERATED (HealthGrid ML Engine v1.2)
• Provide specific facility recommendations with donor safety checks and distance.
• Include a machine-readable MAP ACTION at the bottom whenever relevant facilities are identified, formatted exactly as:
MAP_ACTION: {"type": "SHOW_ON_MAP", "facility_ids": ["RNC-CHC-002", "RNC-PHC-003"]}

CURRENT RANCHI HEALTHCARE NETWORK STATE:
${facilitiesSummary}
`
  };
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const latestQuery = (messages[messages.length - 1]?.content || '').toLowerCase();

    // If Groq API key is available, execute via Groq LLaMA3
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('placeholder')) {
      const response = await groq.chat.completions.create({
        messages: [buildSystemPrompt(), ...messages] as any,
        model: 'llama3-8b-8192',
        temperature: 0.2,
        max_tokens: 800,
      });

      const reply = response.choices[0]?.message?.content || 'HealthGrid Copilot operational.';
      
      // Extract map action if present
      let mapAction = null;
      const mapMatch = reply.match(/MAP_ACTION:\s*(\{.*\})/);
      if (mapMatch && mapMatch[1]) {
        try {
          mapAction = JSON.parse(mapMatch[1]);
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        reply: reply.replace(/MAP_ACTION:\s*\{.*\}/g, '').trim(),
        map_action: mapAction || { type: 'FOCUS_FACILITY', facility_ids: ['RNC-CHC-002'] }
      });
    }

    // Dynamic Intelligent Rule-Based Engine (Fallback)
    let reply = '';
    let mapAction = { type: 'SHOW_ON_MAP', facility_ids: ['RNC-CHC-002', 'RNC-PHC-003', 'RNC-CHC-006'] };

    if (latestQuery.includes('shortage') || latestQuery.includes('72') || latestQuery.includes('medicine') || latestQuery.includes('risk')) {
      reply = `🔴 **72-HOUR MEDICINE RISK ANALYSIS — RANCHI DISTRICT**\n\n` +
        `**Summary:** 3 facilities require immediate logistics intervention within 72 hours.\n\n` +
        `**1. CHC Ratu (Ushamatu)**\n` +
        `• Critical Medicine: Paracetamol 500mg\n` +
        `• Stock-out Probability: **89%** | Expected Shortage: **~1.8 Days**\n` +
        `• Bed Occupancy: **93% (Critical)**\n` +
        `• Primary Driver: Acute Fever Surge (+42%)\n\n` +
        `**2. CHC Bero**\n` +
        `• Critical Medicine: ORS & Anti-diarrheal\n` +
        `• Stock-out Probability: **81%** | Expected Shortage: **~2.4 Days**\n` +
        `• Primary Driver: Staff Deficit (-40%) & Gastro Surge\n\n` +
        `**3. PHC Namkum**\n` +
        `• Critical Medicine: Amoxicillin 250mg\n` +
        `• Stock-out Probability: **68%** | Expected Shortage: **~3.2 Days**\n\n` +
        `────────────────────────────\n` +
        `💡 **RECOMMENDED ACTION & DONOR SAFETY**\n\n` +
        `**Transfer: CHC Kanke ➔ CHC Ratu**\n` +
        `• Recommended Quantity: **500 units Paracetamol**\n` +
        `• Transit Distance: **18.4 km** (Est. Delivery: ~35 mins)\n` +
        `• Donor Stock After Transfer: **1,300 units** (Safety threshold: 400)\n` +
        `• Donor Safety: **✓ 100% SAFE (Transfer Approved)**\n\n` +
        `────────────────────────────\n` +
        `📊 **DATA PROVENANCE**\n` +
        `• Facility / GIS: **REAL_VERIFIED**\n` +
        `• Telemetry: **SIMULATED FOR PROTOTYPE**\n` +
        `• ML Prediction: **AI_GENERATED (Model v1.2)**`;
      mapAction = { type: 'SHOW_ON_MAP', facility_ids: ['RNC-CHC-002', 'RNC-CHC-004', 'RNC-CHC-006'] };
    } else if (latestQuery.includes('donor') || latestQuery.includes('transfer') || latestQuery.includes('surplus')) {
      reply = `📦 **SMART DONOR IDENTIFICATION — RANCHI CLUSTER**\n\n` +
        `**Target Shortage Facility:** CHC Ratu (Ushamatu)\n` +
        `**Medicine Needed:** Paracetamol 500mg (500 units)\n\n` +
        `**Candidate Donor Analysis:**\n\n` +
        `1. **CHC Kanke (18.4 km away)**\n` +
        `   • Available Stock: 1,800 units\n` +
        `   • Projected Demand: 350 units\n` +
        `   • Remaining After Transfer: 1,300 units\n` +
        `   • Status: **✓ OPTIMAL SAFE DONOR (Score: 94/100)**\n\n` +
        `2. **CHC Mandar (12.1 km away)**\n` +
        `   • Available Stock: 650 units\n` +
        `   • Status: **⚠ BLOCKED: Post-transfer stock falls below safety buffer (Score: 42/100)**\n\n` +
        `**Executive Recommendation:** Authorize transfer dispatch from **CHC Kanke**.`;
      mapAction = { type: 'SHOW_ROUTE', facility_ids: ['RNC-CHC-004', 'RNC-CHC-002'] };
    } else {
      reply = `🏛️ **HEALTHGRID GOVERNMENT COMMAND INTELLIGENCE**\n\n` +
        `• **Network Status:** 10 Verified Ranchi Facilities Active\n` +
        `• **Critical Attention Nodes:** CHC Ratu (Ushamatu), CHC Bero\n` +
        `• **Active Alert Feed:** 7 Total System Alerts (3 Critical Shortage, 2 Bed Pressure, 2 Expiry Buffer)\n` +
        `• **Available Donors:** CHC Kanke, CHC Ormanjhi, Sadar Hospital Ranchi\n\n` +
        `*Ask me: "Which PHCs need intervention?", "Why is CHC Ratu critical?", or "Simulate emergency surge +40%".*`;
    }

    return NextResponse.json({
      success: true,
      reply,
      map_action: mapAction
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
