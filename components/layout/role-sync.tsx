"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

/**
 * RoleSync: A background task that ensures the UI is always using 
 * the most up-to-date role from the database.
 */
export function RoleSync() {
  const router = useRouter()
  const lastRole = useRef<string | null>(null)

  useEffect(() => {
    // Initial sync
    lastRole.current = sessionStorage.getItem("role")

    const sync = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) return

        const data = await res.json()
        const currentRole = data.role
        const savedRole = sessionStorage.getItem("role")

        if (currentRole && currentRole !== savedRole) {
          console.log(`[RoleSync] Role mismatch: Session=${savedRole}, DB=${currentRole}. Syncing...`)
          sessionStorage.setItem("role", currentRole)
          
          // Trigger a global UI refresh to reflect new role
          router.refresh()
          
          // Optionally reload if we want a hard sync for the sidebar
          // window.location.reload()
        }
      } catch (err) {
        // Silently fail on network issues
      }
    }

    // Run every 15 seconds to keep the UI fresh without heavy load
    const interval = setInterval(sync, 15000)
    
    // Also sync on window focus (e.g., coming back from another tab)
    window.addEventListener("focus", sync)

    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", sync)
    }
  }, [router])

  return null // This component is purely functional
}
