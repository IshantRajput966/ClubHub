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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1535223289827-42f1e9919769')",
          transform: "translateZ(0)",
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative flex h-screen text-white">
        {/* Sidebar */}
        <div
          className="w-64 fixed h-screen border-r border-white/20"
          style={{ background: "rgba(15, 10, 30, 0.85)", transform: "translate3d(0,0,0)" }}
        >
          <Sidebar />
        </div>

        {/* Main */}
        <div className="flex-1 ml-64 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-7 h-7 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Club Members</h1>
            </div>
            <p className="text-gray-400 text-sm mb-8">Your clubs and fellow members</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "My Clubs",      value: totalClubs,   color: "text-purple-300" },
                { label: "Total Members", value: totalMembers, color: "text-blue-300"   },
                { label: "Events",        value: myClubs.reduce((a, c) => a + c.events.length, 0), color: "text-green-300" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-white/15 p-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
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
                    <div className="border-t border-white/10">
                      {/* Role filter tabs */}
                      <div className="flex gap-2 p-4 pb-2">
                        {(["all", "president", "officer", "member"] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setTab(club.id, t)}
                            className={`text-xs px-3 py-1 rounded-lg border transition font-medium ${
                              tab === t
                                ? "bg-purple-500/30 text-purple-200 border-purple-500/50"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {t === "all" ? `All (${club.members.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)}s (${club.members.filter(m => m.role === t).length})`}
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
    </div>
  )
}
