import { subscribeToEmergencies } from '@/lib/emergencyStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`));

      const unsubscribe = subscribeToEmergencies((event) => {
        try {
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`event: emergency\ndata: ${data}\n\n`));
        } catch (err) {
          console.error('Error writing to SSE stream:', err);
        }
      });

      req.signal.addEventListener('abort', () => {
        unsubscribe();
        try {
          controller.close();
        } catch (e) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
