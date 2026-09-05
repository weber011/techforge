import Groq from 'groq-sdk';

export const GROQ_API_KEY =
  process.env.GROQ_API_KEY || '';

export const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

export const GROQ_MODELS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b',
  'groq/compound-mini',
  'llama-3.3-70b-versatile',
  'llama3-8b-8192',
];

export async function createGroqChatCompletion(options: {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}) {
  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        messages: options.messages as any,
        model: model,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 700,
      });

      const reply = response.choices[0]?.message?.content;
      if (reply) {
        return {
          reply,
          modelUsed: model,
        };
      }
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All Groq models failed to respond.');
}
