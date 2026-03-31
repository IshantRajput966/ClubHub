"use client"

import { useEffect, useState } from "react"
import { CompetitionRegistrationModal } from "@/components/competitions/competition-registration-modal"
import { Calendar, Trophy, Camera, Users, ChevronRight, Loader2, Zap } from "lucide-react"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
}

interface Club {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  members: { username: string; role: string }[]
  events: { id: string; title: string }[]
}

// pending requests the user has sent (clubId → status)
type RequestMap = Record<string, "pending" | "approved" | "rejected">

// ── Helpers ───────────────────────────────────────────────────────────────────

const domainColors: Record<string, string> = {
  tech:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  sports:   "bg-green-500/20 text-green-300 border-green-500/30",
  arts:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
  science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  music:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

function getDomainStyle(domain: string) {
  return domainColors[domain?.toLowerCase()] ?? "bg-white/10 text-gray-300 border-white/20"
}

function formatEventDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return dateStr
  }
}

function isUpcoming(dateStr: string) {
  try { return new Date(dateStr) >= new Date() } catch { return true }
}

// ── Static competitions data ─────────────────────────────────────────────────

const COMPETITIONS = [
  {
    id:          "comp-coding-2026",
    title:       "Coding Challenge",
    deadline:    "Register before March 20",
    description: "Compete in teams of up to 3. Solve algorithmic problems in any language. Top teams win prizes!",
    clubId:      "",   // filled dynamically or leave blank
    clubName:    "Tech Innovators",
  },
  {
    id:          "comp-ai-quiz-2026",
    title:       "AI Quiz Competition",
    deadline:    "Open to all students",
    description: "Test your knowledge of AI, ML, and data science. Individual event. Top 3 win certificates.",
    clubId:      "",
    clubName:    "Tech Innovators",
  },
]

// ── Main Component ────────────────────────────────────────────────────────────

export default function InsightsPanel() {
  const [events, setEvents]           = useState<Event[]>([])
  const [clubs, setClubs]             = useState<Club[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingClubs, setLoadingClubs]   = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [role, setRole]               = useState<string | null>(null)
  const [requestMap, setRequestMap]   = useState<RequestMap>({})
  const [sending, setSending]         = useState<string | null>(null)
  const [activeComp, setActiveComp]   = useState<typeof COMPETITIONS[0] | null>(null)

  // Load user from sessionStorage
  useEffect(() => {
    setCurrentUser(sessionStorage.getItem("username"))
    setRole(sessionStorage.getItem("role"))
  }, [])

  // Fetch upcoming events
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then((data: Event[]) => {
        const upcoming = data
          .filter(e => isUpcoming(e.date))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)
        setEvents(upcoming)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false))
  }, [])

  // Fetch clubs
  useEffect(() => {
    fetch("/api/clubs")
      .then(r => r.json())
      .then((data: Club[]) => {
        const sorted = [...data]
          .sort((a, b) => b.members.length - a.members.length)
          .slice(0, 3)
        setClubs(sorted)
      })
      .catch(() => setClubs([]))
      .finally(() => setLoadingClubs(false))
  }, [])

  // Fetch this user's existing join requests to set button states
  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/join-requests?username=${currentUser}`)
      .then(r => r.json())
      .then((data: { clubId: string; status: string }[]) => {
        const map: RequestMap = {}
        data.forEach(req => {
          map[req.clubId] = req.status as "pending" | "approved" | "rejected"
        })
        setRequestMap(map)
      })
      .catch(() => {})
  }, [currentUser])

  // Send a join request
  async function handleRequestJoin(clubId: string) {
    if (!currentUser) return
    setSending(clubId)
    try {
      await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, username: currentUser }),
      })
      setRequestMap(prev => ({ ...prev, [clubId]: "pending" }))
    } catch {
      // silent fail
    } finally {
      setSending(null)
    }
  }

  function getButtonState(club: Club) {
    // Already a full member
    if (club.members.some(m => m.username === currentUser)) return "member"
    const reqStatus = requestMap[club.id]
    if (reqStatus === "pending")  return "pending"
    if (reqStatus === "approved") return "member"   // approved = they're in
    return "none"
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full p-6 gap-8 overflow-y-auto scrollbar-hide">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Neural Insights</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time Campus Metrics</p>
      </div>

      {/* ── UPCOMING EVENTS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Calendar size={18} />
            <h3 className="font-bold text-xs uppercase tracking-widest">Upcoming Events</h3>
          </div>
          <Link href="/events" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition">
            All <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {loadingEvents ? (
            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase py-2">
              <Loader2 size={12} className="animate-spin" /> Synchronizing...
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-500 text-xs italic">No neural updates detected.</p>
          ) : (
            events.map(event => (
              <Link key={event.id} href="/events" className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.08] hover:border-white/10 transition-all group">
                <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{event.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{formatEventDate(event.date)}</p>
                  <ChevronRight size={14} className="text-gray-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ── CLUB HIGHLIGHTS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Users size={18} />
            <h3 className="font-bold text-xs uppercase tracking-widest">Global Top Tier</h3>
          </div>
          <Link href="/clubs" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition">
            Browse <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {loadingClubs ? (
            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase py-2">
              <Loader2 size={12} className="animate-spin" /> Fetching rankings...
            </div>
          ) : clubs.length === 0 ? (
            <p className="text-gray-500 text-xs italic">No entities found.</p>
          ) : (
            clubs.map(club => {
              const btnState = currentUser ? getButtonState(club) : null
              const isSending = sending === club.id
              return (
                <div key={club.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/clubs/${club.id}`} className="text-sm font-bold text-white hover:text-emerald-400 transition-colors line-clamp-1 block uppercase tracking-tight">
                        {club.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full border-t border-white/5 font-black uppercase tracking-widest bg-gradient-to-br from-white/5 to-transparent ${getDomainStyle(club.domain)}`}>
                          {club.domain}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Users size={10} /> {club.members.length}
                        </span>
                      </div>
                    </div>

                    {role !== "faculty" && (
                      <>
                        {btnState === "member" && (
                          <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            ESTABLISHED
                          </span>
                        )}
                        {btnState === "pending" && (
                          <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse">
                            PENDING
                          </span>
                        )}
                        {btnState === "none" && (
                          <button
                            onClick={() => handleRequestJoin(club.id)}
                            disabled={isSending}
                            className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all hover:scale-105"
                          >
                            {isSending ? <Loader2 size={10} className="animate-spin" /> : "JOIN"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ── COMPETITIONS ── */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-yellow-400">
          <Trophy size={18} />
          <h3 className="font-bold text-xs uppercase tracking-widest">Active Trials</h3>
        </div>
        <div className="flex flex-col gap-3">
          {COMPETITIONS.map(comp => (
            <button
              key={comp.id}
              onClick={() => setActiveComp(comp)}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all text-left w-full group"
            >
              <p className="text-sm font-bold text-white group-hover:text-yellow-200 transition-colors uppercase tracking-tight">{comp.title}</p>
              <p className="text-[10px] text-gray-500 mt-1 font-bold">{comp.deadline}</p>
              <div className="mt-3 flex items-center gap-1.5 text-yellow-500/60 font-bold text-[9px] uppercase tracking-widest">
                <Zap size={10} /> Register Now
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Registration modal */}
      {activeComp && (
        <CompetitionRegistrationModal
          competition={activeComp}
          onClose={() => setActiveComp(null)}
        />
      )}

      {/* ── OPEN SUBMISSIONS ── */}
      <section>
        <div className="flex items-center gap-2 mb-3 text-pink-300">
          <Camera size={16} />
          <h3 className="font-semibold text-sm">Open Submissions</h3>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition">
            <p className="text-sm text-white">Photography Club</p>
            <p className="text-xs text-gray-400 mt-0.5">Submit your best campus photos</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition">
            <p className="text-sm text-white">Literary Club</p>
            <p className="text-xs text-gray-400 mt-0.5">Poetry & short story submissions open</p>
          </div>
        </div>
      </section>

    </div>
  )
}
