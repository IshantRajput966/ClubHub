"use client"

import { useEffect, useState, useCallback } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import {
  Clock, CheckCircle, XCircle, Users, ChevronDown, ChevronUp,
  Loader2, RefreshCw, Search, Filter, TrendingUp, UserCheck, UserX, Bell
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface JoinRequest {
  id:         string
  clubId:     string
  username:   string
  message:    string | null
  status:     "pending" | "approved" | "rejected"
  createdAt:  string
  updatedAt:  string
  clubName:   string
  clubDomain: string
}

interface Club {
  id:      string
  name:    string
  domain:  string
  members: { username: string; role: string }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusStyles = {
  pending:  { bg: "bg-yellow-500/15 border-yellow-500/30",  text: "text-yellow-300",  icon: Clock,       label: "Pending"  },
  approved: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300", icon: CheckCircle, label: "Approved" },
  rejected: { bg: "bg-red-500/15 border-red-500/30",         text: "text-red-300",    icon: XCircle,     label: "Rejected" },
}

const domainColors: Record<string, string> = {
  tech:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  sports:   "bg-green-500/20 text-green-300 border-green-500/30",
  arts:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
  science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  music:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border ${color}`}>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

// ── Student View ──────────────────────────────────────────────────────────────

function StudentView({ username }: { username: string }) {
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [withdrawing, setWithdrawing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetch(`/api/join-requests?username=${username}`).then(r => r.json())
      setRequests(data)
    } catch { setRequests([]) }
    finally  { setLoading(false) }
  }, [username])

  useEffect(() => {
    load()
    // Poll every 10s for status updates
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [load])

  async function handleWithdraw(id: string) {
    setWithdrawing(id)
    try {
      await fetch(`/api/join-requests/${id}`, { method: "DELETE" })
      setRequests(prev => prev.filter(r => r.id !== id))
    } finally { setWithdrawing(null) }
  }

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter)
  const counts   = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Join Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Track your club membership requests</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-white/10 transition text-gray-300" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatBadge label="Total"    value={counts.all}      color="bg-white/5 border-white/10" />
        <StatBadge label="Pending"  value={counts.pending}  color="bg-yellow-500/10 border-yellow-500/20" />
        <StatBadge label="Approved" value={counts.approved} color="bg-emerald-500/10 border-emerald-500/20" />
        <StatBadge label="Rejected" value={counts.rejected} color="bg-red-500/10 border-red-500/20" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
              filter === f
                ? "bg-purple-500/30 text-purple-200 border-purple-500/50"
                : "text-gray-400 border-white/10 hover:bg-white/10"
            }`}
            style={filter !== f ? { background: "rgba(255,255,255,0.05)" } : {}}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 py-12 justify-center">
          <Loader2 size={20} className="animate-spin" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-white">No {filter === "all" ? "" : filter} requests</p>
          <p className="text-sm mt-1 opacity-70">Browse clubs and send a join request</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(req => {
            const s    = statusStyles[req.status]
            const Icon = s.icon
            return (
              <div key={req.id} className={`rounded-2xl border p-4 ${s.bg}`} style={{ backdropFilter: "blur(12px)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-base">{req.clubName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${domainColors[req.clubDomain] ?? "bg-white/10 text-gray-300 border-white/20"}`}>
                        {req.clubDomain}
                      </span>
                    </div>
                    {req.message && (
                      <p className="text-sm text-gray-300 mt-1.5 italic bg-white/5 rounded-lg px-3 py-2">
                        "{req.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{timeAgo(req.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${s.text} px-2.5 py-1 rounded-lg border ${s.bg}`}>
                      <Icon size={13} /> {s.label}
                    </div>
                    {req.status === "pending" && (
                      <button
                        onClick={() => handleWithdraw(req.id)}
                        disabled={withdrawing === req.id}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        {withdrawing === req.id ? "Withdrawing..." : "Withdraw"}
                      </button>
                    )}
                    {req.status === "approved" && (
                      <span className="text-xs text-emerald-400">🎉 Welcome to the club!</span>
                    )}
                    {req.status === "rejected" && (
                      <span className="text-xs text-gray-500">Re-apply from club page</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Leader View ───────────────────────────────────────────────────────────────

function LeaderView({ username }: { username: string }) {
  const [myClubs, setMyClubs]   = useState<Club[]>([])
  const [requests, setRequests] = useState<Record<string, JoinRequest[]>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading]   = useState(true)
  const [acting, setActing]     = useState<string | null>(null)
  const [search, setSearch]     = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async () => {
    try {
      const clubs: Club[] = await fetch("/api/clubs").then(r => r.json())
      const led = clubs.filter(c =>
        c.members.some(m => m.username === username && ["president", "officer"].includes(m.role))
      )
      setMyClubs(led)

      const reqMap: Record<string, JoinRequest[]> = {}
      await Promise.all(led.map(async club => {
        const data = await fetch(`/api/join-requests?clubId=${club.id}`).then(r => r.json())
        reqMap[club.id] = data
      }))
      setRequests(reqMap)

      // Auto-expand clubs with pending
      const exp: Record<string, boolean> = {}
      led.forEach(c => { exp[c.id] = (reqMap[c.id] ?? []).some(r => r.status === "pending") })
      setExpanded(exp)
      setLastRefresh(new Date())
    } catch { setMyClubs([]) }
    finally  { setLoading(false) }
  }, [username])

  useEffect(() => {
    load()
    // Auto-refresh every 15s
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  async function handleAction(requestId: string, clubId: string, status: "approved" | "rejected") {
    setActing(requestId)
    try {
      const res = await fetch(`/api/join-requests/${requestId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      })
      if (res.ok) {
        setRequests(prev => ({
          ...prev,
          [clubId]: prev[clubId].map(r => r.id === requestId ? { ...r, status } : r),
        }))
      }
    } finally { setActing(null) }
  }

  const allRequests  = Object.values(requests).flat()
  const totalPending = allRequests.filter(r => r.status === "pending").length
  const totalApproved = allRequests.filter(r => r.status === "approved").length
  const totalRejected = allRequests.filter(r => r.status === "rejected").length

  if (loading) return (
    <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
      <Loader2 size={20} className="animate-spin" /> Loading club requests...
    </div>
  )

  if (myClubs.length === 0) return (
    <div className="text-center py-16 text-gray-400 max-w-md mx-auto">
      <Users size={40} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium text-white">No clubs to manage</p>
      <p className="text-sm mt-1">You need to be a president or officer to manage requests.</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Join Requests</h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
            {totalPending > 0
              ? <><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse inline-block" />{totalPending} pending request{totalPending !== 1 ? "s" : ""}</>
              : "No pending requests right now"}
            <span className="text-gray-600">· refreshed {timeAgo(lastRefresh.toISOString())}</span>
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-white/10 transition text-gray-300" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatBadge label="Total"    value={allRequests.length} color="bg-white/5 border-white/10" />
        <StatBadge label="Pending"  value={totalPending}       color="bg-yellow-500/10 border-yellow-500/20" />
        <StatBadge label="Approved" value={totalApproved}      color="bg-emerald-500/10 border-emerald-500/20" />
        <StatBadge label="Rejected" value={totalRejected}      color="bg-red-500/10 border-red-500/20" />
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                filterStatus === f
                  ? "bg-purple-600 text-white border-purple-500"
                  : "text-gray-400 border-white/10 hover:bg-white/10"
              }`}
              style={filterStatus !== f ? { background: "rgba(255,255,255,0.05)" } : {}}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Club sections */}
      <div className="flex flex-col gap-4">
        {myClubs.map(club => {
          const clubReqs   = (requests[club.id] ?? [])
            .filter(r => filterStatus === "all" || r.status === filterStatus)
            .filter(r => !search || r.username.toLowerCase().includes(search.toLowerCase()))
          const allClubReqs = requests[club.id] ?? []
          const pending    = allClubReqs.filter(r => r.status === "pending").length
          const isOpen     = expanded[club.id]

          if (clubReqs.length === 0 && filterStatus !== "all") return null

          return (
            <div key={club.id} className="rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>

              {/* Club header */}
              <button onClick={() => setExpanded(prev => ({ ...prev, [club.id]: !prev[club.id] }))}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                    {club.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{club.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${domainColors[club.domain] ?? "bg-white/10 text-gray-300 border-white/20"}`}>
                        {club.domain}
                      </span>
                      <span className="text-xs text-gray-400">{allClubReqs.length} total</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pending > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-500/30 animate-pulse">
                      {pending} pending
                    </span>
                  )}
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Requests */}
              {isOpen && (
                <div className="border-t border-white/10 divide-y divide-white/5">
                  {clubReqs.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">No {filterStatus === "all" ? "" : filterStatus} requests.</p>
                  ) : (
                    clubReqs.map(req => {
                      const s      = statusStyles[req.status]
                      const Icon   = s.icon
                      const acting_ = acting === req.id

                      return (
                        <div key={req.id} className="p-4 flex items-start gap-4 hover:bg-white/3 transition">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                            {req.username[0].toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white">{req.username}</span>
                              <div className={`flex items-center gap-1 text-xs font-medium ${s.text}`}>
                                <Icon size={11} /> {s.label}
                              </div>
                            </div>
                            {req.message && (
                              <p className="text-sm text-gray-400 mt-1 italic bg-white/5 rounded-lg px-3 py-1.5">
                                "{req.message}"
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1.5">{timeAgo(req.createdAt)}</p>
                          </div>

                          {/* Actions */}
                          {req.status === "pending" ? (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleAction(req.id, club.id, "approved")}
                                disabled={acting_}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition disabled:opacity-50"
                              >
                                {acting_ ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(req.id, club.id, "rejected")}
                                disabled={acting_}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs font-semibold border border-red-500/30 transition disabled:opacity-50"
                              >
                                {acting_ ? <Loader2 size={11} className="animate-spin" /> : <UserX size={11} />}
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className={`text-xs font-medium ${s.text} flex items-center gap-1 shrink-0`}>
                              <Icon size={12} /> {s.label}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JoinRequestsPage() {
  const [role, setRole]         = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    setRole(sessionStorage.getItem("role"))
    setUsername(sessionStorage.getItem("username"))
  }, [])

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        {!username ? (
          <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
            <Loader2 size={20} className="animate-spin" /> Loading...
          </div>
        ) : role === "leader" ? (
          <LeaderView username={username} />
        ) : (
          <StudentView username={username} />
        )}
      </div>
    </div>
  )
}
