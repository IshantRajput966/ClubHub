"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import Feed from "@/components/dashboard/feed"
import InsightsPanel from "@/components/layout/insights-panel"
import { useRoleSync } from "@/lib/hooks/use-role-sync"
import Link from "next/link"
import { Users, ChevronRight, Crown, Shield } from "lucide-react"

interface Club {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  members: { username: string; role: string }[]
  events: { id: string; title: string }[]
}

const domainColors: Record<string, string> = {
  tech:     "from-blue-600 to-cyan-600",
  sports:   "from-green-600 to-emerald-600",
  arts:     "from-pink-600 to-rose-600",
  science:  "from-yellow-600 to-orange-600",
  cultural: "from-orange-600 to-red-600",
  music:    "from-purple-600 to-violet-600",
}

function getGradient(domain: string) {
  return domainColors[domain?.toLowerCase()] ?? "from-purple-600 to-violet-600"
}

function MyClubsSection({ username }: { username: string }) {
  const [clubs, setClubs]     = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/clubs")
      .then(r => r.json())
      .then((data: Club[]) => {
        const mine = data.filter(c => c.members.some(m => m.username === username))
        setClubs(mine)
      })
      .catch(() => setClubs([]))
      .finally(() => setLoading(false))
  }, [username])

  if (loading || clubs.length === 0) return null

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white">
          <Users size={18} className="text-purple-400" />
          <h2 className="font-bold text-lg">My Clubs</h2>
        </div>
        <Link href="/clubs" className="text-xs text-purple-400 hover:text-purple-200 flex items-center gap-1 transition">
          Browse all <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {clubs.map(club => {
          const myRole = club.members.find(m => m.username === username)?.role ?? "member"
          return (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="group relative overflow-hidden rounded-xl border border-white/15 hover:border-white/30 transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${getGradient(club.domain)}`} />
              <div className="p-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGradient(club.domain)} flex items-center justify-center text-white font-bold text-lg mb-3 shadow-lg`}>
                  {club.logoUrl
                    ? <img src={club.logoUrl} alt={club.name} className="w-10 h-10 rounded-lg object-cover" />
                    : club.name[0]}
                </div>
                <p className="font-semibold text-white text-sm line-clamp-1 group-hover:text-purple-200 transition">{club.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={10} /> {club.members.length}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {myRole === "president" && <Crown size={11} className="text-yellow-300" />}
                    {myRole === "officer"   && <Shield size={11} className="text-blue-300" />}
                    <span className="capitalize">{myRole}</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null)
  const [role, setRole]         = useState<string | null>(null)

  useRoleSync()

  useEffect(() => {
    setUsername(sessionStorage.getItem("username"))
    setRole(sessionStorage.getItem("role"))
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/dashboard-bg.jpg')",
          transform: "translateZ(0)",
        }}
      />

      {/* Gradient overlay — blends image with purple sidebar theme */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, rgba(0,0,0,0.82) 0%, rgba(8,4,20,0.75) 30%, rgba(20,8,50,0.70) 60%, rgba(45,15,90,0.65) 100%)",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10"
             style={{ background: "radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
             style={{ background: "radial-gradient(circle, rgba(88,28,220,0.6) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative flex h-screen text-white">

        {/* Sidebar */}
        <div
          className="w-64 fixed h-screen"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(10,4,28,0.50) 50%, rgba(45,15,90,0.45) 100%)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            transform: "translate3d(0,0,0)",
          }}
        >
          <Sidebar />
        </div>

        {/* Main feed */}
        <div
          className="flex-1 ml-64 mr-80 overflow-y-auto p-8"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {role === "member" && username && <MyClubsSection username={username} />}
          <Feed />
        </div>

        {/* Insights panel */}
        <div
          className="w-80 fixed right-0 h-screen"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(10,4,28,0.50) 50%, rgba(45,15,90,0.45) 100%)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            transform: "translate3d(0,0,0)",
          }}
        >
          <InsightsPanel />
        </div>

      </div>
    </div>
  )
}
