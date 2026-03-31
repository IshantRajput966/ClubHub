"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
import { BookMarked, Users, Calendar, Crown, Shield, Loader2, ChevronRight } from "lucide-react"

interface Club {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  bannerUrl?: string
  createdBy: string
  members: { username: string; role: string }[]
  events: { id: string; title: string }[]
}

const domainGradients: Record<string, string> = {
  tech:     "from-blue-600 to-cyan-500",
  sports:   "from-green-600 to-emerald-500",
  arts:     "from-pink-600 to-rose-500",
  science:  "from-yellow-600 to-orange-500",
  cultural: "from-orange-600 to-red-500",
  music:    "from-purple-600 to-violet-500",
}

const domainBadge: Record<string, string> = {
  tech:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  sports:   "bg-green-500/20 text-green-300 border-green-500/30",
  arts:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
  science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  music:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

function getRoleIcon(role: string) {
  if (role === "president") return <Crown size={12} className="text-yellow-300" />
  if (role === "officer")   return <Shield size={12} className="text-blue-300" />
  return null
}

function getRoleLabel(role: string) {
  if (role === "president") return <span className="text-yellow-300 text-xs font-medium flex items-center gap-1"><Crown size={11} /> President</span>
  if (role === "officer")   return <span className="text-blue-300 text-xs font-medium flex items-center gap-1"><Shield size={11} /> Officer</span>
  return <span className="text-gray-400 text-xs font-medium flex items-center gap-1"><Users size={11} /> Member</span>
}

export default function MyClubsPage() {
  const [clubs, setClubs]     = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)

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
        setClubs(mine)
      })
      .catch(() => setClubs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto scrollbar-hide z-0 p-10">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <BookMarked className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Affiliation Cache</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Active Membership Stream</p>
              </div>
            </div>
            <Link href="/clubs" className="h-10 px-6 rounded-xl bg-white/[0.03] border border-white/10 text-purple-400 font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2">
              Sync More Entities <ChevronRight size={14} />
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { label: "Joined Entities", value: clubs.length,     color: "text-purple-400" },
              { label: "Total Peers",     value: new Set(clubs.flatMap(c => c.members.map(m => m.username))).size, color: "text-blue-400"   },
              { label: "Temporal Events", value: clubs.reduce((a, c) => a + c.events.length, 0), color: "text-green-400" },
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
              <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
                <Loader2 size={20} className="animate-spin" />
                Loading your clubs...
              </div>
            )}

            {/* Empty */}
            {!loading && clubs.length === 0 && (
              <div className="text-center py-16">
                <BookMarked size={40} className="mx-auto mb-3 text-gray-600" />
                <p className="font-medium text-white">You haven't joined any clubs yet</p>
                <p className="text-sm text-gray-400 mt-1">Browse clubs and send a join request to get started.</p>
                <Link href="/clubs" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition">
                  Browse Clubs <ChevronRight size={14} />
                </Link>
              </div>
            )}

            {/* Club grid */}
            {!loading && clubs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map(club => {
                  const myRole  = club.members.find(m => m.username === username)?.role ?? "member"
                  const gradient = domainGradients[club.domain?.toLowerCase()] ?? "from-purple-600 to-violet-500"
                  const badge    = domainBadge[club.domain?.toLowerCase()] ?? "bg-white/10 text-gray-300 border-white/20"

                  return (
                    <Link
                      key={club.id}
                      href={`/clubs/${club.id}`}
                      className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.02] shadow-2xl"
                    >
                      <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl overflow-hidden border border-white/5 flex flex-col shadow-inner">
                        {/* Club Identity */}
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 shadow-lg group-hover:rotate-3 transition-transform`}>
                                <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center font-black text-xl text-white">
                                  {club.logoUrl ? (
                                    <img src={club.logoUrl} alt={club.name} className="w-full h-full rounded-[14px] object-cover" />
                                  ) : (
                                    club.name[0]
                                  )}
                                </div>
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-purple-400 transition">{club.name}</h3>
                                <div className={`inline-block text-[8px] px-2 py-0.5 rounded-full border border-white/5 font-black uppercase tracking-widest mt-1 bg-gradient-to-br from-white/5 to-transparent ${badge}`}>
                                  {club.domain}
                                </div>
                              </div>
                            </div>
                            <div>{getRoleLabel(myRole)}</div>
                          </div>

                          <p className="text-gray-400 text-sm line-clamp-2 mb-6 italic opacity-80 font-medium leading-relaxed">"{club.description}"</p>

                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <Users size={12} className="text-purple-500" /> {club.members.length} PEERS
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-blue-500" /> {club.events.length} SIGNALS
                              </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-500 transition-all">
                              <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

        </div>
      </div>
    </div>
  )
}
