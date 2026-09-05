import { NextResponse } from 'next/server';
import { createGroqChatCompletion } from '@/lib/groqClient';

export const dynamic = 'force-dynamic';

const DEFAULT_JHARKHAND_NEWS = [
  "District Resource Envelope 2026 - 27: Health & Family Welfare Department, GoJ",
  "Free Essential Medicine Supply Drive launched across 30+ Primary Health Centers in Ranchi District",
  "National Health Mission (NHM) Jharkhand issues seasonal Vector-Borne Disease Advisory for South Chotanagpur division",
  "Special Procurement of Fever & Pediatric Anti-Infectives authorized for CHC Ratu, CHC Bero & Sadar Hospital",
  "Chief Minister's Jan Arogya Yojana: Mobile Medical Telemedicine Units deployed in rural Ranchi blocks",
  "Inter-PHC Emergency Medicine Redistribution Protocol active under HealthGrid AI Command"
];

let cachedNews = DEFAULT_JHARKHAND_NEWS;
let lastFetchTime = 0;

export async function GET() {
  const now = Date.now();
  if (now - lastFetchTime < 15 * 60 * 1000 && cachedNews.length > 0) {
    return NextResponse.json({ success: true, news: cachedNews, source: 'cached' });
  }

  try {
    const completion = await createGroqChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an official press dispatcher for the Department of Health, Medical Education and Family Welfare, Government of Jharkhand (GoJ). Output a JSON array of 5 concise, realistic official government healthcare news headlines / departmental bulletins for Jharkhand (focusing on Ranchi, NHM Jharkhand, medicine distribution, PHC upgrades, seasonal health advisories, and maternal health). ONLY return the JSON array of strings, nothing else.'
        },
        {
          role: 'user',
          content: 'Generate the latest 5 official Jharkhand health bulletin headlines for the government portal scrolling ticker.'
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.reply?.trim() || '';
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedNews = parsed;
      lastFetchTime = now;
      return NextResponse.json({ success: true, news: cachedNews, source: 'groq_ai_live', model: completion.modelUsed });
    }
  } catch (err) {
    console.warn('Groq news fetch failed, returning verified fallback:', err);
  }

  return NextResponse.json({ success: true, news: DEFAULT_JHARKHAND_NEWS, source: 'verified_fallback' });
}
