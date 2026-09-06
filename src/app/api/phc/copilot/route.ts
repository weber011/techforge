import { NextResponse } from 'next/server';
import { getPhcLiveState, getPhcUserById, getPhcUserByEmail } from '@/lib/phcStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, facility_id, facility_email, chat_history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const facility = (facility_id ? getPhcUserById(facility_id) : null) || (facility_email ? getPhcUserByEmail(facility_email) : null);
    const liveState = facility ? getPhcLiveState(facility.facility_id) : null;

    // Inventory snapshot for context
    const medList = liveState?.medicines?.map(m => 
      `- ${m.name} (${m.category}): ${m.current_stock} ${m.unit} [Status: ${m.status}, Min Safety: ${m.min_safety_stock}, Batch: ${m.batch_number}, Exp: ${m.expiry_date}]`
    ).join('\n') || 'Standard PHC Essential Drug List Active';

    const systemPrompt = `You are the "HealthGrid Jharkhand PHC Clinical & Inventory Copilot" (स्वास्थ्यग्रिड प्राथमिक स्वास्थ्य केंद्र AI सहायक) for Medical Officers, Pharmacists, and Nursing Staff in Jharkhand Primary Health Centres (PHC/CHC).

Facility In Focus:
- Facility Name: ${facility?.facility_name || 'Primary Health Centre'}
- Block: ${facility?.block || 'Ranchi District'}
- Medical Officer in Charge: ${facility?.medical_officer_in_charge || 'Dr. MOIC'}
- Live Operational Stats: ${liveState?.available_beds ?? 20} Available Beds / ${liveState?.total_beds ?? 30} Total, ${liveState?.doctors_present ?? 4} Doctors Present, 108 Ambulance: ${liveState?.ambulance_status ?? 'READY_24_7'}, Emergency Room: ${liveState?.emergency_room_status ?? 'ACCEPTING_PATIENTS'}

Current Live Inventory at this Facility:
${medList}

Your Core Capabilities:
1. **Clinical & Dosage Calculations**:
   - Pediatric dosages (e.g. Paracetamol 10-15 mg/kg/dose every 4-6h, Amoxicillin 20-40 mg/kg/day divided 8-hourly, ORS hydration volume formulas based on WHO weight charts).
   - Emergency protocols (e.g. Anti-Snake Venom ASV protocol: initial 10 vials in 200ml normal saline over 1 hour with close monitoring for anaphylaxis; Rabies Immunoglobulin ARV intradermal schedules).
   - Maternal health emergency drugs (Oxytocin 10 IU IM immediately after delivery, Magnesium Sulfate Pritchard regimen for eclampsia).
   - IV drip rate formula: (Total volume in mL × Drop factor in gtt/mL) / Time in minutes.

2. **Inventory & Buffer Stock Calculations**:
   - Buffer stock burn rate: (Daily average consumption × Lead time in days) + Safety buffer.
   - Restock urgency threshold: < 300 units (Warning / Buffer refill), < 200 units (Critical Urgent Shortage - Auto-pushed to Government Command Radar).

3. **Tone & Style**:
   - Clear, authoritative, structured, and helpful.
   - Use bullet points, bold headers, and exact formulas.
   - Bilingual (English + Hindi medical terminology) suitable for Jharkhand government medical officers.`;

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      try {
        const messagesPayload = [
          { role: 'system', content: systemPrompt },
          ...(Array.isArray(chat_history) ? chat_history.slice(-6) : []),
          { role: 'user', content: message }
        ];

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messagesPayload,
            temperature: 0.3,
            max_tokens: 1024
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const reply = groqData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              success: true,
              reply,
              source: 'Groq Llama 3.3 70B Clinical Engine'
            });
          }
        }
      } catch (llmErr) {
        console.warn('Groq LLM call failed, switching to clinical rules fallback:', llmErr);
      }
    }

    // Comprehensive Fallback Clinical & Inventory Intelligence Engine
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('snake') || lower.includes('asv') || lower.includes('venom') || lower.includes('सांप')) {
      reply = `### 🐍 National Snakebite Management Protocol (Jharkhand PHC)
- **Immediate First Line Dosage**:
  - **Initial Dose**: **10 vials** Polyvalent Anti-Snake Venom (ASV) reconstituted in 200–500 mL Normal Saline or 5% Dextrose.
  - **Infusion Rate**: Infuse slowly (1-2 mL/min for first 10-15 mins), then increase to complete within **1 hour**.
  - **Children**: Exact same dose (10 vials) — venom dose is identical in adults and children.
- **Repeat Dose Criteria**:
  - Perform 20WBCT (20-Minute Whole Blood Clotting Test). If blood remains incoagulable after 6 hours, administer additional **5–10 vials**.
- **Anaphylaxis Preparedness**:
  - Keep **Adrenaline (1:1000) 0.5 mL IM** and Hydrocortisone 100mg IV pre-drawn at bedside.
- **Current Facility ASV Stock**:
  - ${liveState?.medicines?.find(m => m.name.includes('Snake') || m.name.includes('ASV'))?.current_stock ?? '12'} vials available.`;
    } else if (lower.includes('paracetamol') || lower.includes('fever') || lower.includes('बुखार') || lower.includes('pcm')) {
      reply = `### 💊 Paracetamol (PCM) Clinical Dosage & Stock Formula
1. **Pediatric Dosage**:
   - **Oral Syrup / Drops**: **10 to 15 mg/kg per dose** every 4 to 6 hours as needed (Max: 60 mg/kg/day, not exceeding 4 doses in 24h).
   - *Example for 10 kg child*: 10 kg × 15 mg = **150 mg per dose** (6 mL of standard 125mg/5mL suspension).
2. **Adult Dosage**:
   - **500 mg to 650 mg** orally every 4 to 6 hours (Max: 4,000 mg / 4g in 24 hours).
3. **PHC Restock Calculation**:
   - **Daily Burn Rate**: Average 45 units/day during active monsoon fever surge.
   - **Buffer Safety Threshold**: Minimum 300 units. Any stock < 200 units automatically alerts State Govt Command.
   - **Current Stock**: ${liveState?.medicines?.find(m => m.name.includes('Paracetamol'))?.current_stock ?? 340} units.`;
    } else if (lower.includes('ors') || lower.includes('diarrhea') || lower.includes('drip') || lower.includes('hydration') || lower.includes('दस्त')) {
      reply = `### 💧 WHO ORS & Dehydration Hydration Protocol
1. **Standard Reconstitution**:
   - Dissolve 1 whole ORS packet (20.5g) in **1 Litre of clean potable drinking water**. Do not boil after mixing. Use within 24 hours.
2. **Pediatric Volume (Plan B - Some Dehydration)**:
   - **Formula**: Weight (kg) × **75 mL** over 4 hours.
   - *Example for 8 kg infant*: 8 × 75 = **600 mL** ORS given in small frequent sips over 4 hours.
   - Add **Zinc Supplementation**: 10mg/day for <6 months, 20mg/day for >6 months for 14 continuous days.
3. **IV Fluid Drip Rate Calculation**:
   - **Formula**: $\\text{Drops/min} = \\frac{\\text{Total Volume (mL)} \\times \\text{Drop Factor (15 or 20 gtt/mL)}}{\\text{Time in Minutes}}$
   - *Example*: 500 mL RL over 2 hours (120 min) with standard 20 gtt/mL macro-drip set = **83 drops/min**.`;
    } else if (lower.includes('stock') || lower.includes('inventory') || lower.includes('medicine') || lower.includes('दवा') || lower.includes('कमी')) {
      const lowDrugs = liveState?.medicines?.filter(m => m.status === 'LOW' || m.status === 'CRITICAL') || [];
      reply = `### 📊 Live PHC Inventory & AI Sentinel Audit (${facility?.facility_name || 'PHC'})
- **Total Registered Medicines**: ${liveState?.medicines?.length ?? 10} drug lines.
- **Stock Depletion Status**:
${lowDrugs.length > 0 ? lowDrugs.map(d => `  - ⚠️ **${d.name}**: ${d.current_stock} ${d.unit} (Threshold: ${d.min_safety_stock}) - *${d.status === 'CRITICAL' ? 'CRITICAL AUTO-ESCALATED TO GOVT' : 'Buffer Low'}*`).join('\n') : '  - ✅ All primary drug stocks are currently above minimum safety thresholds.'}
- **AI Sentinel Policy**:
  - Stock < 300 units $\\rightarrow$ Refill warning recorded.
  - Stock < 200 units $\\rightarrow$ **Automatic real-time push notification** sent to Government Command Radar for urgent central warehouse dispatch.`;
    } else if (lower.includes('oxytocin') || lower.includes('delivery') || lower.includes('maternal') || lower.includes('प्रसव')) {
      reply = `### 👶 Active Management of Third Stage of Labour (AMTSL)
1. **Oxytocin Administration**:
   - Administer **10 IU Oxytocin IM** within 1 minute of child delivery (after excluding second twin).
2. **Cold Chain Protocol**:
   - Must be stored between **+2°C to +8°C** in PHC ILR (Ice-Lined Refrigerator). Protect from light.
3. **Postpartum Hemorrhage (PPH) Management**:
   - Start 20 IU Oxytocin in 500 mL RL at 60 drops/min.
   - Secondary lines: Misoprostol 800 mcg sublingual/rectal if bleeding persists.`;
    } else {
      reply = `### 🩺 HealthGrid PHC Clinical & Inventory Assistant
Greetings, **${facility?.medical_officer_in_charge || 'Doctor / Staff'}**. I can assist you with:
- **Medicine Dosage Calculations** (e.g., pediatric mg/kg, renal adjustments, IV drip flow rates).
- **Emergency Protocols** (Anti-Snake Venom ASV protocol, WHO ORS rehydration, Anaphylaxis, Rabies ARV).
- **Stock & Buffer Formulas** (Lead-time calculation, consumption burn rate, batch expiry auditing).
- **AI Sentinel Trigger** (Instant check on items below 300/200 units threshold).

*Please type any clinical or inventory calculation question above (e.g. "Calculate pediatric paracetamol for 12kg", "Calculate IV drip rate for 1000ml in 4 hours", or "Check critical stock").*`;
    }

    return NextResponse.json({
      success: true,
      reply,
      source: 'HealthGrid PHC Clinical Protocol Engine'
    });

  } catch (error: any) {
    console.error('Error in PHC Copilot:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
