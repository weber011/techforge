import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { INITIAL_PHCS } from '@/lib/upstash';

export const dynamic = 'force-dynamic';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_placeholder_key_for_build',
});

// Format PHCs context for the AI prompt
const phcDirectoryContext = INITIAL_PHCS.map(p => 
  `• ${p.name} (${p.district}, ${p.state}) - Beds: ${p.totalBeds}, Status: ${p.type === 'EMERGENCY' ? '24/7 Emergency & Inpatient' : 'Standard Inpatient & OPD'}`
).join('\n');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const systemPrompt = {
      role: 'system',
      content: `You are the "HealthGrid Citizen Health AI Assistant", an empathetic, intelligent public healthcare advisor for citizens across India.

Your primary responsibilities:
1. FACILITY FINDER: Help citizens locate the nearest Primary Health Center (PHC) across Bihar, Uttar Pradesh, and Jharkhand from the verified directory below.
2. MINOR AILMENT & FIRST AID GUIDANCE: Provide helpful, safe, non-prescription home care advice for minor ailments (e.g. mild fever, seasonal flu, dehydration, heat stroke, minor cuts, indigestion, ORS usage).
3. SAFETY & TRIAGE GUARDRAILS: Always remind citizens that you are an AI assistant and recommend visiting a doctor or the nearest PHC if symptoms are severe (e.g. high fever >102°F, breathlessness, chest discomfort, severe injury).
4. TONE: Warm, caring, culturally aware, concise, and structured with bullet points.

VERIFIED PHC DIRECTORY:
${phcDirectoryContext}

Keep responses helpful, structured, and easy to understand for any citizen.`
    };

    // If Groq API key is configured and not placeholder, call Groq LLM
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('placeholder')) {
      const response = await groq.chat.completions.create({
        messages: [systemPrompt, ...messages] as any,
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 600,
      });

      const reply = response.choices[0]?.message?.content || "I am here to assist you with finding your nearest health center or offering basic healthcare guidance.";
      return NextResponse.json({ success: true, reply });
    }

    // Dynamic Intelligent Rule-Based Fallback if Groq key is pending
    const userQuery = (messages[messages.length - 1]?.content || '').toLowerCase();
    let reply = '';

    if (userQuery.includes('patna') || userQuery.includes('bihar')) {
      reply = `📍 **Recommended Facilities in Patna (Bihar):**\n\n` +
        `1. **Patna Sadar PHC** (Patna Central) - 35 Inpatient Beds, 24/7 OPD\n` +
        `2. **Danapur PHC** (Danapur Sub-division) - 40 Beds, Maternal & Child Care\n` +
        `3. **Phulwari Sharif PHC** - 25 Beds, General Consultation\n\n` +
        `💡 *Tip: For urgent emergency admissions, visit Patna Sadar PHC or Danapur PHC.*`;
    } else if (userQuery.includes('lucknow') || userQuery.includes('varanasi') || userQuery.includes('up') || userQuery.includes('uttar pradesh')) {
      reply = `📍 **Recommended Facilities in Uttar Pradesh:**\n\n` +
        `1. **Hazratganj Urban PHC** (Lucknow Central) - 50 Inpatient Beds, Full Diagnostics\n` +
        `2. **Chinhat PHC** (Lucknow) - 35 Beds, 24/7 Emergency Unit\n` +
        `3. **Kashi Urban PHC** (Varanasi) - 40 Inpatient Beds\n\n` +
        `🚑 *Emergency Helpline: 108 / 102*`;
    } else if (userQuery.includes('ranchi') || userQuery.includes('dhanbad') || userQuery.includes('jharkhand')) {
      reply = `📍 **Recommended Facilities in Jharkhand:**\n\n` +
        `1. **Ranchi Sadar PHC** (Ranchi Central) - 45 Inpatient Beds, Emergency & Vaccine Center\n` +
        `2. **Kanke PHC** (Ranchi) - 35 Inpatient Beds\n` +
        `3. **Dhanbad Urban PHC** (Dhanbad) - 40 Beds, 24/7 OPD\n\n` +
        `💡 *All primary health centers provide free essential medicines and doctor consultations.*`;
    } else if (userQuery.includes('fever') || userQuery.includes('cold') || userQuery.includes('flu') || userQuery.includes('cough')) {
      reply = `🩺 **Home Care & First Aid Advice for Mild Fever / Cold:**\n\n` +
        `• **Hydration**: Drink plenty of warm fluids, coconut water, or warm soup.\n` +
        `• **Rest**: Take adequate rest to support your immune recovery.\n` +
        `• **Temperature Monitoring**: Keep a record of your temperature every 4-6 hours.\n` +
        `• **Sponge**: If fever is elevated, use a room-temperature damp cloth sponge on forehead.\n\n` +
        `⚠️ **When to visit your nearest PHC:**\n` +
        `If fever exceeds 102°F (38.9°C), persists for more than 48 hours, or is accompanied by severe shivering or breathing difficulty, please visit your nearest PHC immediately.`;
    } else if (userQuery.includes('dehydration') || userQuery.includes('diarrhea') || userQuery.includes('vomit') || userQuery.includes('ors')) {
      reply = `💧 **Dehydration & Electrolyte Recovery Protocol:**\n\n` +
        `• **Oral Rehydration Salts (ORS)**: Mix 1 sachet of ORS in 1 Liter of clean drinking water. Drink small sips regularly.\n` +
        `• **Fluids**: Have light fluids like rice water, dal soup, and coconut water.\n` +
        `• **Avoid**: Avoid caffeinated, fizzy, or overly sugary drinks.\n\n` +
        `⚠️ *Visit your nearest PHC immediately if you notice extreme dizziness, dry mouth, or inability to retain fluids.*`;
    } else {
      reply = `👋 **Hello! I am your HealthGrid Public Health AI Assistant.**\n\n` +
        `I can help you with:\n` +
        `• 🏥 **Locating Nearest PHC**: Tell me your city/district (e.g., *Patna, Lucknow, Ranchi, Gaya, Varanasi, Dhanbad*).\n` +
        `• 💊 **First Aid & Health Guidance**: Ask for home remedies for mild fever, dehydration, cough, or general wellness.\n` +
        `• 🚑 **Emergency Facility Readiness**: Inquire about 24/7 bed availability.\n\n` +
        `*How can I assist your health today?*`;
    }

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('Public Assistant Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
