// app/api/notifications/stream/route.ts
import { subscribe, unsubscribe } from "@/lib/notification-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return new Response("username required", { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial ping to confirm connection
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`)
      )

      // Register listener for this user
      const listener = (payload: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          )
        } catch {
          // Stream closed
        }
      }

      subscribe(username, listener)

      // Keepalive ping every 20 seconds
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`)
          )
        } catch {
          clearInterval(keepalive)
        }
      }, 20000)

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(keepalive)
        unsubscribe(username, listener)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
