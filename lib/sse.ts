type Subscriber = (data: any) => void;

const channels = new Map<string, Set<Subscriber>>();

export function subscribe(channel: string, fn: Subscriber): () => void {
  if (!channels.has(channel)) channels.set(channel, new Set());
  channels.get(channel)!.add(fn);
  return () => {
    const s = channels.get(channel);
    if (s) {
      s.delete(fn);
      if (s.size === 0) channels.delete(channel);
    }
  };
}

export function publish(channel: string, data: any): number {
  const subs = channels.get(channel);
  if (!subs) return 0;
  let count = 0;
  for (const fn of subs) {
    try {
      fn(data);
      count++;
    } catch {}
  }
  return count;
}

export function sseStream(channel: string): Response {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      send({ type: "connected", channel, ts: Date.now() });

      unsubscribe = subscribe(channel, (data) => send(data));

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {}
      }, 25000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
