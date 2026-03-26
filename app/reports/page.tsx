"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import {
  BarChart2, Users, Calendar, BookOpen, TrendingUp,
  MessageSquare, UserPlus, Award, Activity, Clock,
  ChevronUp, ChevronDown, Loader2, Shield, Globe
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
interface ReportData {
  clubSummaries:     any[]
  memberStats:       any[]
  totalMembers:      number
  topMembers:        any[]
  totalEvents:       number
  upcomingEvents:    number
  eventsByMonth:     any[]
  topEvents:         any[]
  joinRequestStats:  any[]
  recentRequests:    any[]
  totalPosts:        number
  postsByAuthor:     any[]
  recentPosts:       any[]
  domainBreakdown:   any[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const domainColors: Record<string, string> = {
  tech:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  sports:   "bg-green-500/20 text-green-300 border-green-500/30",
  cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  music:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  arts:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
  other:    "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

const domainBar: Record<string, string> = {
  tech:     "bg-blue-500",
  sports:   "bg-green-500",
  cultural: "bg-orange-500",
  science:  "bg-yellow-500",
  music:    "bg-purple-500",
  arts:     "bg-pink-500",
  other:    "bg-gray-500",
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any, label: string, value: string | number, sub?: string, color: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 p-5 flex items-center gap-4"
         style={{ background: "rgba(255,255,255,0.05)" }}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, color }: { icon: any, title: string, color: string }) {
  return (
    <div className={`flex items-center gap-2 mb-4`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={14} />
      </div>
      <h2 className="text-base font-bold text-white">{title}</h2>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [data, setData]       = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [role, setRole]       = useState<string | null>(null)
  const [sortClub, setSortClub] = useState<"members" | "events">("members")
  const [clubAsc, setClubAsc]   = useState(false)

  useEffect(() => {
    const r = sessionStorage.getItem("role")
    setRole(r)
    if (r !== "faculty") { setLoading(false); return }

    fetch("/api/reports")
      .then(res => res.json())
      .then(setData)
      .catch(() => setError("Failed to load reports"))
      .finally(() => setLoading(false))
  }, [])

  if (role !== "faculty") {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <Shield size={40} className="text-gray-600" />
          <p className="text-gray-400 font-medium">Faculty access only</p>
          <p className="text-gray-600 text-sm">You need faculty role to view reports.</p>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 size={24} className="animate-spin" /> Loading reports...
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-red-400">{error ?? "No data"}</div>
    </div>
  )

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalClubs   = data.clubSummaries.length
  const pendingReqs  = data.joinRequestStats.find((r: any) => r.status === "pending")?.count ?? 0
  const approvedReqs = data.joinRequestStats.find((r: any) => r.status === "approved")?.count ?? 0

  const sortedClubs = [...data.clubSummaries].sort((a, b) => {
    const key = sortClub === "members" ? "memberCount" : "eventCount"
    return clubAsc ? a[key] - b[key] : b[key] - a[key]
  })

  const maxMembers = Math.max(...data.clubSummaries.map(c => c.memberCount), 1)
  const maxEvents  = Math.max(...data.clubSummaries.map(c => c.eventCount), 1)
  const maxPosts   = Math.max(...data.postsByAuthor.map((p: any) => p.count), 1)
  const maxMonth   = Math.max(...data.eventsByMonth.map((m: any) => m.count), 1)

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <BarChart2 size={20} className="text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Faculty Reports</h1>
              <p className="text-gray-400 text-sm">Campus-wide activity overview — IIST Indore</p>
            </div>
          </div>

          {/* ── Top Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Globe}       label="Total Clubs"      value={totalClubs}            color="bg-purple-500/20 text-purple-300" />
            <StatCard icon={Users}       label="Total Members"    value={data.totalMembers}      color="bg-blue-500/20 text-blue-300" />
            <StatCard icon={Calendar}    label="Total Events"     value={data.totalEvents}       sub={`${data.upcomingEvents} upcoming`} color="bg-green-500/20 text-green-300" />
            <StatCard icon={MessageSquare} label="Total Posts"    value={data.totalPosts}        color="bg-pink-500/20 text-pink-300" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={UserPlus}    label="Pending Requests"  value={pendingReqs}           color="bg-yellow-500/20 text-yellow-300" />
            <StatCard icon={Award}       label="Approved Requests" value={approvedReqs}          color="bg-emerald-500/20 text-emerald-300" />
            <StatCard icon={Activity}    label="Active Clubs"      value={totalClubs}            color="bg-orange-500/20 text-orange-300" />
            <StatCard icon={TrendingUp}  label="Domains"           value={data.domainBreakdown.length} color="bg-cyan-500/20 text-cyan-300" />
          </div>

          {/* ── Club Activity ── */}
          <div className="rounded-2xl border border-white/10 p-6 mb-6" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader icon={BookOpen} title="Club Activity Summary" color="bg-purple-500/20 text-purple-300" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSortClub("members"); setClubAsc(sortClub === "members" ? !clubAsc : false) }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${sortClub === "members" ? "border-purple-400 text-purple-300 bg-purple-500/10" : "border-white/10 text-gray-400 hover:border-white/20"}`}
                >
                  Members {sortClub === "members" && (clubAsc ? <ChevronUp size={10} className="inline" /> : <ChevronDown size={10} className="inline" />)}
                </button>
                <button
                  onClick={() => { setSortClub("events"); setClubAsc(sortClub === "events" ? !clubAsc : false) }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${sortClub === "events" ? "border-purple-400 text-purple-300 bg-purple-500/10" : "border-white/10 text-gray-400 hover:border-white/20"}`}
                >
                  Events {sortClub === "events" && (clubAsc ? <ChevronUp size={10} className="inline" /> : <ChevronDown size={10} className="inline" />)}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sortedClubs.map(club => (
                <div key={club.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition">
                  <div className="w-40 min-w-[10rem]">
                    <p className="text-white text-sm font-medium truncate">{club.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${domainColors[club.domain] ?? domainColors.other}`}>
                      {club.domain}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-14">Members</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(club.memberCount / maxMembers) * 100}%` }} />
                      </div>
                      <span className="text-xs text-white w-6 text-right">{club.memberCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-14">Events</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(club.eventCount / maxEvents) * 100}%` }} />
                      </div>
                      <span className="text-xs text-white w-6 text-right">{club.eventCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Member Stats + Domain Breakdown ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Member role breakdown */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
              <SectionHeader icon={Users} title="Member Role Breakdown" color="bg-blue-500/20 text-blue-300" />
              <div className="space-y-3">
                {data.memberStats.map((s: any) => {
                  const total = data.totalMembers
                  const pct   = Math.round((s.count / total) * 100)
                  const colors: Record<string, string> = {
                    student: "bg-gray-400", member: "bg-blue-400",
                    leader: "bg-yellow-400", faculty: "bg-purple-400"
                  }
                  return (
                    <div key={s.role}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300 capitalize">{s.role}</span>
                        <span className="text-white">{s.count} <span className="text-gray-500">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[s.role] ?? "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Top members by club count */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Most Active Members</p>
                <div className="space-y-2">
                  {data.topMembers.slice(0, 5).map((m: any, i: number) => (
                    <div key={m.username} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4">{i + 1}.</span>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-[10px] font-bold">
                          {m.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white">{m.username}</span>
                      </div>
                      <span className="text-xs text-purple-300">{m.clubCount} clubs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Domain breakdown */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
              <SectionHeader icon={Globe} title="Club Domain Breakdown" color="bg-orange-500/20 text-orange-300" />
              <div className="space-y-3">
                {data.domainBreakdown.map((d: any) => {
                  const max = Math.max(...data.domainBreakdown.map((x: any) => x.count))
                  return (
                    <div key={d.domain} className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium w-20 text-center ${domainColors[d.domain] ?? domainColors.other}`}>
                        {d.domain}
                      </span>
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${domainBar[d.domain] ?? "bg-gray-500"}`}
                             style={{ width: `${(d.count / max) * 100}%` }} />
                      </div>
                      <span className="text-sm text-white w-4 text-right">{d.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Events by Month + Top Events ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Events by month */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
              <SectionHeader icon={Calendar} title="Events by Month" color="bg-green-500/20 text-green-300" />
              <div className="space-y-2">
                {data.eventsByMonth.length === 0 ? (
                  <p className="text-gray-500 text-sm">No event data</p>
                ) : (
                  data.eventsByMonth.map((m: any) => (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-16">{m.month}</span>
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(m.count / maxMonth) * 100}%` }} />
                      </div>
                      <span className="text-xs text-white w-4">{m.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top events by attendance */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
              <SectionHeader icon={Award} title="Top Events by Attendance" color="bg-yellow-500/20 text-yellow-300" />
              <div className="space-y-3">
                {data.topEvents.map((e: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition">
                    <span className="text-lg font-bold text-gray-600 w-6 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-1">{e.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{e.date} · {e.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-green-300 text-sm font-bold">{e.attendeeCount}</p>
                      <p className="text-gray-500 text-[10px]">/ {e.capacity}</p>
                    </div>
                  </div>
                ))}
                {data.topEvents.length === 0 && <p className="text-gray-500 text-sm">No attendance data yet</p>}
              </div>
            </div>
          </div>

          {/* ── Join Request Trends + Recent ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Join request status */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
              <SectionHeader icon={UserPlus} title="Join Request Trends" color="bg-yellow-500/20 text-yellow-300" />
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["pending", "approved", "rejected"].map(status => {
                  const stat  = data.joinRequestStats.find((r: any) => r.status === status)
                  const count = stat?.count ?? 0
                  const cfg   = {
                    pending:  { color: "text-yellow-300", bg: "bg-yellow-500/10 border-yellow-500/20" },
                    approved: { color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    rejected: { color: "text-red-300",    bg: "bg-red-500/10 border-red-500/20" },
                  }[status]!
                  return (
                    <div key={status} className={`rounded-xl border p-3 text-center ${cfg.bg}`}>
                      <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{status}</p>
                    </div>
                  )
                })}
              </div>

              {/* Recent requests */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Requests</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.recentRequests.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                    <div>
                      <span className="text-white font-medium">{r.username}</span>
                      <span className="text-gray-400"> → {r.clubName}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      r.status === "pending"  ? "bg-yellow-500/20 text-yellow-300" :
                      r.status === "approved" ? "bg-emerald-500/20 text-emerald-300" :
                      "bg-red-500/20 text-red-300"
                    }`}>{r.status}</span>
                  </div>
                ))}
                {data.recentRequests.length === 0 && <p className="text-gray-500 text-xs">No requests yet</p>}
              </div>
            </div>

            {/* Post activity */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
              <SectionHeader icon={MessageSquare} title="Post Activity" color="bg-pink-500/20 text-pink-300" />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Most Active Posters</p>
              <div className="space-y-2 mb-5">
                {data.postsByAuthor.map((p: any, i: number) => (
                  <div key={p.author} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{i + 1}.</span>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {p.author[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-white">{p.author}</span>
                        <span className="text-pink-300">{p.count} posts</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(p.count / maxPosts) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Posts</p>
              <div className="space-y-2">
                {data.recentPosts.map((p: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-[9px] font-bold">
                        {p.author[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-purple-300">{p.author}</span>
                      <span className="text-[10px] text-gray-500 ml-auto flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{p.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
