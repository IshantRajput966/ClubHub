"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Crown, Shield, User, Calendar, ChevronDown } from "lucide-react"

interface ClubMember {
  username: string
  role: string
  joinedAt?: string
}

interface Club {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  members: ClubMember[]
  events: { id: string; title: string }[]
}

const domainColors: Record<string, string> = {
  tech:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  sports:   "bg-green-500/20 text-green-300 border-green-500/30",
  arts:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
  science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  music:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

const roleConfig = {
  president: { icon: Crown,  color: "text-yellow-300", bg: "bg-yellow-500/20 border-yellow-500/30", label: "President" },
  officer:   { icon: Shield, color: "text-blue-300",   bg: "bg-blue-500/20 border-blue-500/30",     label: "Officer"   },
  member:    { icon: User,   color: "text-gray-300",   bg: "bg-white/10 border-white/20",           label: "Member"    },
}

function getRoleConfig(role: string) {
  return roleConfig[role as keyof typeof roleConfig] ?? roleConfig.member
}

function avatarColor(username: string) {
  const colors = [
    "from-purple-500 to-violet-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
    "from-pink-500 to-rose-600",
    "from-orange-500 to-yellow-600",
  ]
  const i = username.charCodeAt(0) % colors.length
  return colors[i]
}

export default function MembersPage() {
  const [myClubs, setMyClubs]     = useState<Club[]>([])
  const [loading, setLoading]     = useState(true)
  const [username, setUsername]   = useState<string | null>(null)
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<Record<string, "all" | "president" | "officer" | "member">>({})

  useEffect(() => {
    const user = sessionStorage.getItem("username")
    setUsername(user)
    if (!user) { setLoading(false); return }

    fetch("/api/clubs")
      .then(r => r.json())
      .then((data: Club[]) => {
        const mine = data.filter(c =>
          c.members.some(m => m.username === user)
        )
        setMyClubs(mine)
        // Auto-expand all clubs
        const exp: Record<string, boolean> = {}
        const tabs: Record<string, "all"> = {}
        mine.forEach(c => { exp[c.id] = true; tabs[c.id] = "all" })
        setExpanded(exp)
        setActiveTab(tabs)
      })
      .catch(() => setMyClubs([]))
      .finally(() => setLoading(false))
  }, [])

  function toggleClub(clubId: string) {
    setExpanded(prev => ({ ...prev, [clubId]: !prev[clubId] }))
  }

  function setTab(clubId: string, tab: "all" | "president" | "officer" | "member") {
    setActiveTab(prev => ({ ...prev, [clubId]: tab }))
  }

  const totalMembers = new Set(myClubs.flatMap(c => c.members.map(m => m.username))).size
  const totalClubs   = myClubs.length

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto scrollbar-hide z-0 p-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Personnel Directory</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Neural Signature Database</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { label: "My Clubs",      value: totalClubs,   color: "text-purple-400" },
              { label: "Total Active",  value: totalMembers, color: "text-blue-400"   },
              { label: "Pulse Points",  value: myClubs.reduce((a, c) => a + c.events.length, 0), color: "text-green-400" },
            ].map(s => (
              <div key={s.label} className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.02] shadow-2xl">
                <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{s.label}</p>
                  <p className={`text-4xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
              </div>
            )}

            {/* No clubs */}
            {!loading && myClubs.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium text-white">You haven't joined any clubs yet</p>
                <p className="text-sm mt-1">Browse clubs and send a join request to get started.</p>
              </div>
            )}

            {/* Club sections */}
            {!loading && myClubs.map(club => {
              const isOpen   = expanded[club.id]
              const tab      = activeTab[club.id] ?? "all"
              const myRole   = club.members.find(m => m.username === username)?.role ?? "member"
              const filtered = tab === "all" ? club.members : club.members.filter(m => m.role === tab)

              return (
                <div
                  key={club.id}
                  className="mb-4 rounded-2xl border border-white/15 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {/* Club header */}
                  <button
                    onClick={() => toggleClub(club.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center font-bold text-lg shadow">
                        {club.name[0]}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{club.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${domainColors[club.domain] ?? "bg-white/10 text-gray-300 border-white/20"}`}>
                            {club.domain}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {club.members.length} member{club.members.length !== 1 ? "s" : ""} · You are a <span className="capitalize text-purple-300">{myRole}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Members list */}
                  {isOpen && (
                    <div className="p-6 border-t border-white/5 space-y-6">
                      {/* Role filter tabs */}
                      <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
                        {(["all", "president", "officer", "member"] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setTab(club.id, t)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                              tab === t
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                                : "text-gray-600 hover:text-white"
                            }`}
                          >
                            {t === "all" ? `Aether` : t}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 pt-2 grid grid-cols-1 gap-2">
                        {filtered.map(member => {
                          const rc   = getRoleConfig(member.role)
                          const Icon = rc.icon
                          const isMe = member.username === username
                          return (
                            <div
                              key={member.username}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                                isMe
                                  ? "border-purple-500/40 bg-purple-500/10"
                                  : "border-white/10 bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              {/* Avatar */}
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(member.username)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                {member.username[0].toUpperCase()}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white">
                                    {member.username}
                                    {isMe && <span className="text-purple-400 text-xs ml-1">(you)</span>}
                                  </p>
                                </div>
                              </div>

                              {/* Role badge */}
                              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${rc.bg} ${rc.color}`}>
                                <Icon size={11} />
                                {rc.label}
                              </div>
                            </div>
                          )
                        })}

                        {filtered.length === 0 && (
                          <p className="text-gray-400 text-sm text-center py-4">No {tab}s in this club.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

        </div>
      </div>
    </div>
  )
}
