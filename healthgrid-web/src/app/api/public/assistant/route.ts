import { NextResponse } from 'next/server';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export const dynamic = 'force-dynamic';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1));
}

export async function POST(req: Request) {
  try {
    const { messages, userLocation } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Messages are required' }, { status: 400 });
    }

    const latestUserMsg = messages[messages.length - 1]?.content || '';
    const lower = latestUserMsg.toLowerCase();

    // Check if AI API Key is available
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

    let matchedFacilityIds: string[] = [];

    // Local Tool Calling / Backend Lookup
    let relevantFacilities = RANCHI_FACILITIES_MASTER;
    if (userLocation?.latitude && userLocation?.longitude) {
      relevantFacilities = [...RANCHI_FACILITIES_MASTER]
        .map(f => ({ ...f, dist: haversine(userLocation.latitude, userLocation.longitude, f.latitude, f.longitude) }))
        .sort((a, b) => a.dist - b.dist);
      matchedFacilityIds = relevantFacilities.slice(0, 3).map(f => f.facility_id);
    } else {
      matchedFacilityIds = ['RNC-DH-001', 'RNC-CHC-002', 'RNC-CHC-004'];
    }

    if (!apiKey) {
      // Deterministic Clinical & Facility Guidance without fake numbers
      let reply = '';
      if (lower.includes('ratu') || lower.includes('phc') || lower.includes('hospital') || lower.includes('near') || lower.includes('bed')) {
        const top = relevantFacilities.slice(0, 3);
        reply = `🏥 **Verified Ranchi Healthcare Facilities:**\n\n` +
          top.map((f, i) => `${i+1}. **${f.facility_name}** (${f.facility_type})\n   📍 ${f.address}\n   📞 Contact: ${f.phone}\n   🩺 Services: ${f.services.slice(0, 3).join(', ')}`).join('\n\n') +
          `\n\n*For medical emergencies, please dial **108**.*`;
      } else if (lower.includes('fever') || lower.includes('headache') || lower.includes('cold')) {
        reply = `🌡️ **First-Aid Advice for Mild Fever:**\n\n1. **Hydration:** Drink plenty of clean boiled water, ORS, and tender coconut water.\n2. **Rest:** Get adequate physical rest in a well-ventilated room.\n3. **Monitoring:** If temperature exceeds 101°F or persists over 48 hours, visit your nearest Primary Health Centre immediately.\n\n*Nearest Facility:* **${relevantFacilities[0].facility_name}** (${relevantFacilities[0].address}).`;
      } else if (lower.includes('dehydration') || lower.includes('ors') || lower.includes('diarrhea')) {
        reply = `💧 **Oral Rehydration Therapy (ORS) Guidance:**\n\n1. Dissolve 1 full ORS sachet in 1 Litre of clean drinking water.\n2. Sip 200-400ml after every loose stool.\n3. Free ORS packets are stocked at all government PHCs and Sub-Centres across Ranchi.\n\n*Nearest Centre:* **${relevantFacilities[0].facility_name}**.`;
      } else {
        reply = `Namaste! I am the **HealthGrid Citizen AI Assistant**.\n\nI can help you locate verified government healthcare facilities across Ranchi, check OPD timings, and provide first-aid guidance for mild symptoms.\n\n*Nearest available hospital:* **${relevantFacilities[0].facility_name}** (${relevantFacilities[0].address}). For urgent assistance, dial **108** (Ambulance) or **104** (Medical helpline).`;
      }

      return NextResponse.json({
        success: true,
        reply,
        map_action: {
          type: 'SHOW_FACILITIES',
          facility_ids: matchedFacilityIds
        }
      });
    }

    // Call Groq / OpenAI LLM
    try {
      const { Groq } = await import('groq-sdk');
      const groq = new Groq({ apiKey });

      const systemPrompt = `You are HealthGrid Citizen AI Assistant for the Government of Jharkhand Health Department.
Your job is to assist citizens in locating verified healthcare facilities (PHC, CHC, Sadar Hospital) across Ranchi and Jharkhand, and provide first-aid advice for mild symptoms.
Available verified facilities in database:
${RANCHI_FACILITIES_MASTER.map(f => `- ${f.facility_id}: ${f.facility_name} (${f.facility_type}) in ${f.block}, address: ${f.address}, phone: ${f.phone}, services: ${f.services.join(', ')}`).join('\n')}

Always provide empathetic, accurate, and actionable guidance. Remind citizens to dial 108 for emergency ambulances.`;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 500
      });

      const reply = response.choices[0]?.message?.content || 'Verified healthcare services are available at your nearest PHC.';

      return NextResponse.json({
        success: true,
        reply,
        map_action: {
          type: 'SHOW_FACILITIES',
          facility_ids: matchedFacilityIds
        }
      });
    } catch (llmErr) {
      return NextResponse.json({
        success: true,
        reply: `🏥 **Nearest Health Facilities in Ranchi:**\n\n1. **${relevantFacilities[0].facility_name}** - ${relevantFacilities[0].address}\n2. **${relevantFacilities[1].facility_name}** - ${relevantFacilities[1].address}\n\n*Dial 108 for Emergency Ambulance Services.*`,
        map_action: {
          type: 'SHOW_FACILITIES',
          facility_ids: matchedFacilityIds
        }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'AI Assistant is currently unavailable.' }, { status: 500 });
  }
}
