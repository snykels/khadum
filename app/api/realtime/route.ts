import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      sendEvent("connected", { message: "متصل بالوقت الفعلي" });

      const interval = setInterval(() => {
        sendEvent("stats", {
          timestamp: new Date().toISOString(),
          activeUsers: Math.floor(Math.random() * 50) + 100,
          pendingOrders: Math.floor(Math.random() * 20) + 5,
          newNotifications: Math.floor(Math.random() * 5),
        });
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
