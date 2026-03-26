"use client"

// lib/hooks/use-notifications.ts
import { useEffect, useRef, useCallback } from "react"

type NotificationPayload = {
  type: "request_approved" | "request_rejected" | "new_request" | "ping"
  clubName?: string
  clubId?: string
  requestId?: string
  username?: string
  timestamp: number
}

type Options = {
  onApproved?: (payload: NotificationPayload) => void
  onRejected?: (payload: NotificationPayload) => void
  onNewRequest?: (payload: NotificationPayload) => void
}

export function useNotifications(username: string | null, options: Options = {}) {
  const esRef = useRef<EventSource | null>(null)
  const optsRef = useRef(options)
  optsRef.current = options

  useEffect(() => {
    if (!username) return

    function connect() {
      const es = new EventSource(`/api/notifications/stream?username=${username}`)
      esRef.current = es

      es.onmessage = (e) => {
        try {
          const payload: NotificationPayload = JSON.parse(e.data)
          if (payload.type === "ping") return

          if (payload.type === "request_approved") {
            optsRef.current.onApproved?.(payload)
          } else if (payload.type === "request_rejected") {
            optsRef.current.onRejected?.(payload)
          } else if (payload.type === "new_request") {
            optsRef.current.onNewRequest?.(payload)
          }
        } catch {}
      }

      es.onerror = () => {
        es.close()
        // Reconnect after 3 seconds
        setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
    }
  }, [username])
}
