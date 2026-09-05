import { NextResponse } from 'next/server';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';
import { createGroqChatCompletion } from '@/lib/groqClient';

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

    let relevantFacilities = RANCHI_FACILITIES_MASTER;
    let locationContext = 'Citizen location not provided. Listing key Ranchi facilities.';
    if (userLocation?.latitude && userLocation?.longitude) {
      relevantFacilities = [...RANCHI_FACILITIES_MASTER]
        .map(f => ({ ...f, dist: haversine(userLocation.latitude, userLocation.longitude, f.latitude, f.longitude) }))
        .sort((a, b) => a.dist - b.dist);
      locationContext = `Citizen live coordinates: Lat ${userLocation.latitude}, Lng ${userLocation.longitude}. Nearest facilities: ${relevantFacilities.slice(0, 4).map(f => f.facility_name + ' (' + (f as any).dist + ' km away)').join(', ')}.`;
    }

    const matchedFacilityIds = relevantFacilities.slice(0, 3).map(f => f.facility_id);

    const facilitiesKnowledge = relevantFacilities.map(f => 
      `• ${f.facility_name} (${f.facility_type}) | Block: ${f.block} | Address: ${f.address} | Phone: ${f.phone} | Hours: ${f.opening_hours} | Emergency: ${f.emergency_available ? 'YES (24/7)' : 'NO'} | Beds: ${f.total_beds} | Services: ${f.services.join(', ')}`
    ).join('\n');

    const systemPrompt = `You are 'AI Swasthya Mitra' (AI स्वास्थ्य मित्र), the official AI Citizen Healthcare Advisor for the Government of Jharkhand Health Department (Ranchi District).

YOUR MISSION:
1. Help citizens find the nearest verified Primary Health Centres (PHC), Community Health Centres (CHC), Sub-Divisional Hospitals (SDH), and Sadar Hospital in Ranchi.
2. Provide verified, safe first-aid & home remedies for mild symptoms (fever, ORS hydration, cold, cough, minor wounds).
3. Guide citizens on OPD timings, government schemes (Ayushman Bharat / CM Jan Arogya Yojana), and free medicine supplies.
4. For any serious red-flag symptom (chest pain, severe breathlessness, profuse bleeding, high trauma), immediately instruct the citizen to call 108 for Emergency Ambulance.

CONTEXT & VERIFIED FACILITIES DATA:
${locationContext}

VERIFIED RANCHI FACILITIES:
${facilitiesKnowledge}

GUIDELINES & FORMATTING RULES:
- CRITICAL: DO NOT use markdown tables (| col | col |). Tables break narrow chat bubbles.
- CRITICAL: DO NOT output raw HTML tags like <br> or <div>.
- Structure all replies with clean emojis, bold titles (**...**), bullet points (•), and numbered lists.
- Be warm, helpful, empathetic, and professional in English / Hindi / Hinglish.
- For medical symptoms, clearly separate "Home First-Aid / What to do" and "When to Seek Immediate Medical Care".
- When recommending facilities, state their name, block, address, contact number, and key services.
- Always include emergency helpline numbers (108 for Ambulance, 104 for Health Helpline).`;

    try {
      const completion = await createGroqChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.3,
        max_tokens: 700
      });

      return NextResponse.json({
        success: true,
        reply: completion.reply,
        model: completion.modelUsed,
        map_action: {
          type: 'SHOW_FACILITIES',
          facility_ids: matchedFacilityIds
        }
      });
    } catch (groqError: any) {
      console.warn('Groq completion failed, falling back to deterministic advice:', groqError);
      
      const latestUserMsg = messages[messages.length - 1]?.content || '';
      const lower = latestUserMsg.toLowerCase();
      let reply = '';
      if (lower.includes('ratu') || lower.includes('phc') || lower.includes('hospital') || lower.includes('near') || lower.includes('bed')) {
        const top = relevantFacilities.slice(0, 3);
        reply = `🏥 **Verified Ranchi Healthcare Facilities:**\n\n` +
          top.map((f: any, i) => `${i+1}. **${f.facility_name}** (${f.facility_type})\n   📍 ${f.address}\n   📞 Contact: ${f.phone}\n   🩺 Services: ${f.services.slice(0, 3).join(', ')}`).join('\n\n') +
          `\n\n*For medical emergencies, please dial **108**.*`;
      } else if (lower.includes('fever') || lower.includes('headache') || lower.includes('cold')) {
        reply = `🌡️ **First-Aid Advice for Mild Fever:**\n\n1. **Hydration:** Drink plenty of clean boiled water, ORS, and tender coconut water.\n2. **Rest:** Get adequate physical rest in a well-ventilated room.\n3. **Monitoring:** If temperature exceeds 101°F or persists over 48 hours, visit your nearest Primary Health Centre immediately.\n\n*Nearest Facility:* **${relevantFacilities[0].facility_name}** (${relevantFacilities[0].address}).`;
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
  } catch (error: any) {
    console.error('AI assistant route error:', error);
    return NextResponse.json({ success: false, error: 'AI Assistant is currently unavailable.' }, { status: 500 });
  }
}
