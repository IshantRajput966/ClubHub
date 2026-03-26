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
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535223289827-42f1e9919769')", transform: "translateZ(0)" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative flex h-screen text-white">
        <div className="w-64 fixed h-screen border-r border-white/20" style={{ background: "rgba(15,10,30,0.85)", transform: "translate3d(0,0,0)" }}>
          <Sidebar />
        </div>

        <div className="flex-1 ml-64 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <BookMarked className="w-7 h-7 text-purple-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">My Clubs</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Clubs you are a member of</p>
                </div>
              </div>
              <Link href="/clubs" className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-200 transition">
                Browse all clubs <ChevronRight size={14} />
              </Link>
            </div>

            {/* Stats */}
            {!loading && clubs.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-white/15 p-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <p className="text-gray-400 text-xs mb-1">Clubs Joined</p>
                  <p className="text-2xl font-bold text-purple-300">{clubs.length}</p>
                </div>
                <div className="rounded-xl border border-white/15 p-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <p className="text-gray-400 text-xs mb-1">Total Members</p>
                  <p className="text-2xl font-bold text-blue-300">
                    {new Set(clubs.flatMap(c => c.members.map(m => m.username))).size}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 p-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <p className="text-gray-400 text-xs mb-1">Total Events</p>
                  <p className="text-2xl font-bold text-green-300">
                    {clubs.reduce((a, c) => a + c.events.length, 0)}
                  </p>
                </div>
              </div>
            )}

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clubs.map(club => {
                  const myRole  = club.members.find(m => m.username === username)?.role ?? "member"
                  const gradient = domainGradients[club.domain?.toLowerCase()] ?? "from-purple-600 to-violet-500"
                  const badge    = domainBadge[club.domain?.toLowerCase()] ?? "bg-white/10 text-gray-300 border-white/20"

                  return (
                    <Link
                      key={club.id}
                      href={`/clubs/${club.id}`}
                      className="group rounded-2xl border border-white/15 hover:border-white/30 overflow-hidden transition-all duration-200 hover:scale-[1.02]"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {/* Banner / gradient header */}
                      {club.bannerUrl ? (
                        <div className="h-28 overflow-hidden">
                          <img src={club.bannerUrl} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className={`h-28 bg-gradient-to-br ${gradient} opacity-80`} />
                      )}

                      <div className="p-5">
                        {/* Club name + domain */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            {club.logoUrl ? (
                              <img src={club.logoUrl} alt={club.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white/20" />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-lg shadow`}>
                                {club.name[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white group-hover:text-purple-200 transition">{club.name}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge}`}>
                                {club.domain}
                              </span>
                            </div>
                          </div>
                          {/* My role badge */}
                          <div>{getRoleLabel(myRole)}</div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{club.description}</p>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users size={11} /> {club.members.length} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {club.events.length} events
                          </span>
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
    </div>
  )
}
