"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import Feed from "@/components/dashboard/feed"
import InsightsPanel from "@/components/layout/insights-panel"
import { useRoleSync } from "@/lib/hooks/use-role-sync"
import Link from "next/link"
import { Users, ChevronRight, Crown, Shield, Plus, Bell, Calendar as CalendarIcon, ClipboardList, MessageSquare } from "lucide-react"
import { CreateEventModal } from "@/components/events/create-event-modal"
import { CreateAnnouncementModal } from "@/components/announcements/create-announcement-modal"
import { MobileHeader } from "@/components/layout/mobile-header"

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
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-white">
          <Users size={20} className="text-purple-400" />
          <h2 className="font-bold text-xl tracking-tight">My Organizations</h2>
        </div>
        <Link href="/clubs" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition">
          Browse all <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clubs.map(club => {
          const m = club.members.find(m => m.username === username)
          const myRole = m?.role ?? "member"
          return (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-6 border border-white/5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(club.domain)} flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-1 ring-white/20`}>
                  {club.logoUrl
                    ? <img src={club.logoUrl} alt={club.name} className="w-14 h-14 rounded-2xl object-cover" />
                    : club.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-lg line-clamp-1 group-hover:text-purple-300 transition-colors uppercase tracking-tight">{club.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1"><Users size={10} /> {club.members.length}</span>
                    <div className="flex items-center gap-1 text-[10px] text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      {(myRole === "president" || myRole === "leader") && <Crown size={10} className="text-yellow-400" />}
                      {myRole === "officer"   && <Shield size={10} className="text-blue-400" />}
                      <span>{myRole}</span>
                    </div>
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

function LeaderQuickActions({ onPostEvent, onPostAnnouncement }: { onPostEvent: () => void, onPostAnnouncement: () => void }) {
  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 text-white mb-6">
        <Crown size={20} className="text-yellow-400 font-bold" />
        <h2 className="font-bold text-xl tracking-tight">Leader Nexus</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button
          onClick={onPostEvent}
          className="relative group p-1 rounded-3xl bg-gradient-to-b from-purple-500/20 to-transparent transition-all hover:scale-[1.02]"
        >
          <div className="h-full w-full rounded-[23px] bg-black/40 backdrop-blur-3xl p-6 border border-white/5 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/40 transition-colors">
              <CalendarIcon size={24} className="text-purple-300" />
            </div>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Post Event</span>
          </div>
        </button>

        <button
          onClick={onPostAnnouncement}
          className="relative group p-1 rounded-3xl bg-gradient-to-b from-blue-500/20 to-transparent transition-all hover:scale-[1.02]"
        >
          <div className="h-full w-full rounded-[23px] bg-black/40 backdrop-blur-3xl p-6 border border-white/5 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
              <Bell size={24} className="text-blue-300" />
            </div>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Broadcast</span>
          </div>
        </button>

        <Link
          href="/join-requests"
          className="relative group p-1 rounded-3xl bg-gradient-to-b from-purple-500/20 to-transparent transition-all hover:scale-[1.02]"
        >
          <div className="h-full w-full rounded-[23px] bg-black/40 backdrop-blur-3xl p-6 border border-white/5 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/40 transition-colors">
              <ClipboardList size={24} className="text-purple-300" />
            </div>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Requests</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

function LeaderSmsFeed() {
  const [replies, setReplies] = useState<any[]>([])

  useEffect(() => {
    const fetchReplies = () => fetch("/api/sms-replies").then(r => r.json()).then(data => {
      if(Array.isArray(data)) setReplies(data)
    }).catch(() => {})
    
    fetchReplies()
    const int = setInterval(fetchReplies, 5000)
    return () => clearInterval(int)
  }, [])

  if (replies.length === 0) return null

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 text-white mb-6">
        <MessageSquare size={20} className="text-pink-400" />
        <h2 className="font-bold text-xl tracking-tight uppercase">Neural Matrix Feed</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] rounded-full animate-pulse font-bold tracking-widest">
           LIVE NETWORK
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {replies.map(r => (
          <div key={r.id} className="p-6 rounded-[31px] bg-black/40 backdrop-blur-3xl border border-pink-500/10 hover:border-pink-500/30 transition-all">
             <p className="text-gray-300 leading-relaxed italic">"{r.message}"</p>
             <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
               <span className="text-[10px] text-pink-500/70 font-bold uppercase tracking-widest">Protocol: Twilio Webhook</span>
               <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(r.createdAt).toLocaleTimeString()}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen]     = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [role, setRole]         = useState<string | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isAnnModalOpen, setIsAnnModalOpen]   = useState(false)

  useRoleSync()

  useEffect(() => {
    setUsername(sessionStorage.getItem("username"))
    setRole(sessionStorage.getItem("role"))
  }, [])

  const handleCreateEvent = async (data: any) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed")
    window.location.reload() // Refresh to show in feed
  }

  const handleCreateAnn = async (data: any) => {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed")
    window.location.reload() // Refresh to show in feed
  }

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col lg:flex-row text-white bg-[#02020a]">
      <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
      
      {/* Sidebar container */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-20 lg:pt-10 scrollbar-hide">
          <div className="max-w-4xl mx-auto">
            {role === "leader" && (
              <LeaderQuickActions
                onPostEvent={() => setIsEventModalOpen(true)}
                onPostAnnouncement={() => setIsAnnModalOpen(true)}
              />
            )}

            {["leader", "president", "officer", "faculty"].includes(role ?? "") && <LeaderSmsFeed />}

            {["member", "leader"].includes(role ?? "") && username && <MyClubsSection username={username} />}
            <Feed />
          </div>
        </div>

        {/* Insights panel - Hidden on mobile */}
        <div className="hidden lg:block w-80 shrink-0 h-screen bg-black/20 border-l border-white/5 z-10 transition-all">
          <InsightsPanel />
        </div>

      <CreateEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onCreate={handleCreateEvent}
      />
      <CreateAnnouncementModal
        isOpen={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        onCreate={handleCreateAnn}
      />
    </div>
  )
}
