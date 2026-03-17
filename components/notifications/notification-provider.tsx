"use client"

// components/notifications/notification-provider.tsx
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { CheckCircle, XCircle, UserPlus, X, Sparkles, Trophy } from "lucide-react"

// ── Toast types ───────────────────────────────────────────────────────────────

type Toast = {
  id: string
  type: "approved" | "rejected" | "new_request" | "competition_registration"
  title: string
  message: string
  clubId?: string
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function fireConfetti() {
  const colors = ["#a855f7", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"]
  const container = document.createElement("div")
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;"
  document.body.appendChild(container)

  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div")
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size  = Math.random() * 8 + 4
    const left  = Math.random() * 100
    const delay = Math.random() * 0.8
    const dur   = Math.random() * 1.5 + 1.5

    el.style.cssText = `
      position:absolute;
      left:${left}%;
      top:-20px;
      width:${size}px;
      height:${size}px;
      background:${color};
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      animation: confetti-fall ${dur}s ${delay}s ease-in forwards;
      transform: rotate(${Math.random() * 360}deg);
    `
    container.appendChild(el)
  }

  const style = document.createElement("style")
  style.textContent = `
    @keyframes confetti-fall {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
  `
  document.head.appendChild(style)
  setTimeout(() => { container.remove(); style.remove() }, 4000)
}

// ── Role upgrade animation ────────────────────────────────────────────────────

function RoleUpgradeBanner({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-bounce-in">
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-purple-900/50 border border-purple-400/30">
        <Sparkles size={20} className="text-yellow-300" />
        <div>
          <p className="font-bold text-sm">You're now a Club Member! 🎉</p>
          <p className="text-xs text-purple-200">Your access has been upgraded</p>
        </div>
      </div>
      <style>{`
        @keyframes bounce-in {
          0%   { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          60%  { transform: translateX(-50%) translateY(6px);   opacity: 1; }
          100% { transform: translateX(-50%) translateY(0);     opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease forwards; }
      `}</style>
    </div>
  )
}

// ── Toast component ───────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 6000)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  const config = {
    approved:    { icon: CheckCircle, bg: "from-green-600/90 to-emerald-600/90",  border: "border-green-400/30", iconColor: "text-green-200"  },
    rejected:    { icon: XCircle,     bg: "from-red-600/90 to-rose-600/90",        border: "border-red-400/30",   iconColor: "text-red-200"    },
    new_request: { icon: UserPlus,    bg: "from-purple-600/90 to-violet-600/90",   border: "border-purple-400/30",iconColor: "text-purple-200" },
    competition_registration: { icon: Trophy, bg: "from-yellow-600/90 to-amber-600/90", border: "border-yellow-400/30", iconColor: "text-yellow-200" },
  }[toast.type]

  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 bg-gradient-to-r ${config.bg} backdrop-blur-xl border ${config.border} rounded-xl p-4 shadow-xl min-w-[280px] max-w-[340px]`}
      style={{ animation: "slide-in-right 0.35s ease forwards" }}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{toast.title}</p>
        <p className="text-white/70 text-xs mt-0.5">{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="text-white/50 hover:text-white transition shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

// ── Main provider ─────────────────────────────────────────────────────────────

export default function NotificationProvider() {
  const router = useRouter()
  const [username, setUsername]         = useState<string | null>(null)
  const [role, setRole]                 = useState<string | null>(null)
  const [toasts, setToasts]             = useState<Toast[]>([])
  const [showUpgrade, setShowUpgrade]   = useState(false)
  // Track pending count for badge (leaders)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    setUsername(sessionStorage.getItem("username"))
    setRole(sessionStorage.getItem("role"))
  }, [])

  // Poll pending requests count for leaders
  useEffect(() => {
    if (role !== "leader" || !username) return

    async function fetchPending() {
      try {
        const clubs = await fetch("/api/clubs").then(r => r.json())
        const myClubs = clubs.filter((c: any) =>
          c.members?.some((m: any) => m.username === username && ["president", "officer"].includes(m.role))
        )
        let count = 0
        await Promise.all(myClubs.map(async (club: any) => {
          const reqs = await fetch(`/api/join-requests?clubId=${club.id}`).then(r => r.json())
          count += reqs.filter((r: any) => r.status === "pending").length
        }))
        setPendingCount(count)
      } catch {}
    }

    fetchPending()
    const interval = setInterval(fetchPending, 10000)
    return () => clearInterval(interval)
  }, [role, username])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  // Poll for competition registration notifications (leaders only)
  useEffect(() => {
    if (role !== "leader" || !username) return

    async function fetchLeaderNotifs() {
      try {
        const rows = await fetch(`/api/leader-notifications?username=${username}`).then(r => r.json())
        rows.forEach((row: any) => {
          addToast({
            type:    "competition_registration",
            title:   row.title,
            message: row.body,
          })
        })
      } catch {}
    }

    fetchLeaderNotifs()
    const interval = setInterval(fetchLeaderNotifs, 8000)
    return () => clearInterval(interval)
  }, [role, username, addToast])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useNotifications(username, {
    onApproved: (payload) => {
      // Upgrade role in sessionStorage
      sessionStorage.setItem("role", "member")
      setRole("member")
      setShowUpgrade(true)
      fireConfetti()

      addToast({
        type:    "approved",
        title:   "Request Approved! 🎉",
        message: `You've been approved to join ${payload.clubName}`,
        clubId:  payload.clubId,
      })

      // Refresh page after short delay so sidebar updates
      setTimeout(() => window.location.reload(), 2500)
    },

    onRejected: (payload) => {
      addToast({
        type:    "rejected",
        title:   "Request Rejected",
        message: `Your request to join ${payload.clubName} was not approved`,
        clubId:  payload.clubId,
      })
    },

    onNewRequest: (payload) => {
      setPendingCount(prev => prev + 1)
      addToast({
        type:    "new_request",
        title:   "New Join Request",
        message: `${payload.username} wants to join ${payload.clubName}`,
        clubId:  payload.clubId,
      })
    },
  })

  // Expose pending count globally so sidebar can read it
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__clubhub_pending = pendingCount
    }
  }, [pendingCount])

  return (
    <>
      {/* Role upgrade banner */}
      {showUpgrade && <RoleUpgradeBanner onDone={() => setShowUpgrade(false)} />}

      {/* Toast stack */}
      <div className="fixed bottom-24 right-6 z-[9998] flex flex-col gap-2 items-end">
        <style>{`
          @keyframes slide-in-right {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </>
  )
}
