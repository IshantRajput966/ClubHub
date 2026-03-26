// lib/notification-store.ts
// Attached to globalThis so it persists across all Next.js API route invocations

type NotificationPayload = {
  type: "request_approved" | "request_rejected" | "new_request" | "ping"
  clubName?: string
  clubId?: string
  requestId?: string
  username?: string
  timestamp: number
}

type Listener = (payload: NotificationPayload) => void

// Attach to globalThis so the SAME Map is reused across all API route calls
// Without this, each route gets its own module instance and listeners are lost
const g = globalThis as any
if (!g.__clubhub_listeners) {
  g.__clubhub_listeners = new Map<string, Set<Listener>>()
}
const listeners: Map<string, Set<Listener>> = g.__clubhub_listeners

export function subscribe(username: string, listener: Listener) {
  if (!listeners.has(username)) {
    listeners.set(username, new Set())
  }
  listeners.get(username)!.add(listener)
}

export function unsubscribe(username: string, listener: Listener) {
  listeners.get(username)?.delete(listener)
  if (listeners.get(username)?.size === 0) {
    listeners.delete(username)
  }
}

export function notify(username: string, payload: NotificationPayload) {
  const userListeners = listeners.get(username)
  console.log(`[notify] username=${username} listeners=${userListeners?.size ?? 0}`)
  if (!userListeners) return
  userListeners.forEach(fn => fn(payload))
}

export function getConnectedUsers(): string[] {
  return Array.from(listeners.keys())
}
