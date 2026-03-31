"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * useRoleSync
 * Polls /api/join-requests for approved requests.
 * If found and current role is still "student", upgrades sessionStorage role
 * to "member" and refreshes the page so the new UI kicks in.
 */
export function useRoleSync() {
  const router = useRouter()

  useEffect(() => {
    const username = sessionStorage.getItem("username")
    const role     = sessionStorage.getItem("role")

    // Only poll for students — members/leaders don't need this
    if (!username || role !== "student") return

    async function check() {
      try {
        const res  = await fetch(`/api/join-requests?username=${username}`)
        const data = await res.json()

        const hasApproved = Array.isArray(data) && data.some((r: any) => r.status === "approved")

        if (hasApproved) {
          sessionStorage.setItem("role", "member")
          // Hard refresh so sidebar + pages re-render with member role
          window.location.reload()
        }
      } catch {
        // silent — best-effort sync
      }
    }

    // Check immediately, then every 15 seconds
    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [])
}
