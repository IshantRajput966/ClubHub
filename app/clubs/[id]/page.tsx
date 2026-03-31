"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { 
  Users, Calendar, Share2, UserPlus, ArrowLeft, Clock, 
  CheckCircle, Loader2, X, Text, BookOpen, Clock as ClockIcon, MessageSquare,
  AlertTriangle, LogOut
} from "lucide-react"
import Link from "next/link"

interface ClubDetail {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  bannerUrl?: string
  createdBy: string
  members: Array<{ username: string; role: string; joinedAt: string }>
  events: Array<{
    event: {
      id: string
      title: string
      description: string
      date: string
      time: string
      location: string
      capacity: number
      attendees: Array<{ username: string }>
    }
  }>
  createdAt: string
}

type JoinState = "none" | "pending" | "member" | "sending" | "leave_pending"

export default function ClubDetailPage() {
  const params  = useParams()
  const clubId  = params?.id as string

  const [club, setClub]           = useState<ClubDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [joinState, setJoinState] = useState<JoinState>("none")
  const [username, setUsername]   = useState<string | null>(null)
  const [role, setRole]           = useState<string | null>(null)
  
  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  // Join Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  
  // Twilio SMS Modal State
  const [joinData, setJoinData] = useState({
    name: "",
    branch: "",
    year: "",
    message: ""
  })

  useEffect(() => {
    const user = sessionStorage.getItem("username")
    const r    = sessionStorage.getItem("role")
    setUsername(user)
    setRole(r)
    if (clubId) fetchClub(user)
  }, [clubId])

  const fetchClub = async (user: string | null) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/clubs/${clubId}`)
      if (!response.ok) throw new Error("Failed to fetch club")
      const data = await response.json()
      setClub(data)

      if (!user) { setIsLoading(false); return }

      // Check if already a member
      if (data.members.some((m: any) => m.username === user)) {
        setJoinState("member")
        setIsLoading(false)
        return
      }

      const reqRes  = await fetch(`/api/join-requests?username=${user}`)
      const reqData = await reqRes.json()
      const myReq   = reqData.find((r: any) => r.clubId === clubId)

      if (myReq?.status === "pending") {
        if (myReq.type === "leave") setJoinState("leave_pending")
        else setJoinState("pending")
      }
      else if (myReq?.status === "approved" && myReq.type === "join") setJoinState("member")
      else setJoinState("none")

      setError(null)
    } catch (err) {
      setError("Failed to load club details")
    } finally {
      setIsLoading(false)
    }
  }

  const submitJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !clubId) return
    setJoinState("sending")
    setIsJoinModalOpen(false) // Close modal immediately
    try {
      const res = await fetch("/api/join-requests", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ 
          clubId, 
          username,
          ...joinData // Includes name, branch, year, message
        }),
      })
      if (res.status === 409) {
        setJoinState("pending")
        return
      }
      if (!res.ok) throw new Error("Failed")
      setJoinState("pending")
    } catch {
      setJoinState("none")
      alert("Encryption error across neural nets. Please try again.")
    }
  }
  
  const handleLeaveClub = async () => {
    if (!username || !clubId) return
    setIsLeaving(true)
    try {
      const res = await fetch(`/api/clubs/${clubId}/leave`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Membership termination requested via Neural Interface." })
      })
      if (!res.ok) throw new Error("Failed to leave")
      setJoinState("leave_pending")
      setIsLeaveModalOpen(false)
    } catch {
      alert("Departure request transmission failed. Please try again.")
    } finally {
      setIsLeaving(false)
    }
  }

  function JoinButton() {
    if (joinState === "member") {
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-5 h-5" />
            Joined
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all group"
            title="Terminate Membership"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            Leave Club
          </button>
        </div>
      )
    }

    if (joinState === "leave_pending") {
      return (
        <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30">
          <Clock className="w-5 h-5" />
          Departure Pending
        </div>
      )
    }

    if (joinState === "sending") {
      return (
        <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30">
          <Loader2 className="w-5 h-5 animate-spin" />
          Sending...
        </div>
      )
    }

    return (
      <button
        onClick={() => setIsJoinModalOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
      >
        <UserPlus className="w-5 h-5" />
        Join Club
      </button>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Club not found</p>
        </div>
      </div>
    )
  }

  const memberCount = club.members.length
  const eventCount  = club.events.length
  const president   = club.members.find(m => m.role === "president")

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />

      <div className="flex-1 overflow-y-auto relative">
        {/* Back */}
        <div className="sticky top-0 bg-black/80 backdrop-blur py-4 px-8 border-b border-purple-500/20 z-40">
          <Link href="/clubs" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Clubs
          </Link>
        </div>

        {/* Banner */}
        {club.bannerUrl ? (
          <div className="w-full h-64 overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20">
            <img src={club.bannerUrl} alt={club.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-purple-600/30 to-pink-600/30" />
        )}

        <div className="max-w-7xl mx-auto px-8 pb-8">
          {/* Club header */}
          <div className="flex items-end gap-6 mb-8 -mt-16 relative z-10">
            {club.logoUrl && (
              <img src={club.logoUrl} alt={club.name} className="w-24 h-24 rounded-lg border-4 border-slate-950 object-cover" />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{club.name}</h1>
              <div className="flex items-center gap-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                  {club.domain}
                </span>
                <span className="text-gray-400">Founded by {club.createdBy}</span>
              </div>
            </div>

            {/* Only show join button if not the club's own president AND not faculty */}
            {username !== club.createdBy && role !== "faculty" && <JoinButton />}
          </div>

          {/* Pending notice */}
          {joinState === "pending" && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <p className="text-yellow-300 font-medium text-sm">Join request sent!</p>
                <p className="text-yellow-300/60 text-xs mt-0.5">
                  Waiting for a club leader to approve your request. You'll be notified instantly when they respond.
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 text-lg mb-8">{club.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
              <Users className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-gray-400 text-sm">Members</p>
              <p className="text-3xl font-bold text-white">{memberCount}</p>
            </div>
            <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
              <Calendar className="w-6 h-6 text-pink-400 mb-2" />
              <p className="text-gray-400 text-sm">Events</p>
              <p className="text-3xl font-bold text-white">{eventCount}</p>
            </div>
            <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-6">
              <Share2 className="w-6 h-6 text-green-400 mb-2" />
              <p className="text-gray-400 text-sm">President</p>
              <p className="text-xl font-bold text-white">{president?.username || "N/A"}</p>
            </div>
          </div>

          {/* Members */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Members ({memberCount})</h2>
            <div className="bg-slate-900 border border-purple-500/20 rounded-lg overflow-hidden">
              {memberCount === 0 ? (
                <div className="p-8 text-center text-gray-400">No members yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Username</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Role</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {club.members.map(member => (
                        <tr key={member.username} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors">
                          <td className="py-4 px-6">
                            <p className="text-white font-semibold">{member.username}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                              {member.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-gray-400 text-sm">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Twilio SMS Join Request Modal ── */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsJoinModalOpen(false)} />
          <div 
            className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
            style={{ background: "linear-gradient(145deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)", backdropFilter: "blur(20px)" }}
          >
            {/* Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[2px]" />

            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Join {club?.name}</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Connect with the President</p>
                </div>
              </div>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitJoinRequest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-purple-400 transition-colors">Full Name</label>
                  <div className="relative">
                    <Text size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      required type="text" value={joinData.name} onChange={e => setJoinData({...joinData, name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">Year of Study</label>
                  <div className="relative">
                    <ClockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                    <select
                      required value={joinData.year} onChange={e => setJoinData({...joinData, year: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      <option value="" className="bg-black">Select Year...</option>
                      {["1st Year","2nd Year","3rd Year","4th Year"].map(y => <option key={y} value={y} className="bg-black">{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-400 transition-colors">Academic Branch</label>
                <div className="relative">
                  <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    required type="text" value={joinData.branch} onChange={e => setJoinData({...joinData, branch: e.target.value})}
                    placeholder="e.g. Computer Science Engineering"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-purple-400 transition-colors">Direct Message to President</label>
                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3 top-3 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
                  <textarea
                    required rows={3} value={joinData.message} onChange={e => setJoinData({...joinData, message: e.target.value})}
                    placeholder="Why do you want to join? Any relevant skills?"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white flex focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>
                <p className="text-[9px] text-gray-600 italic mt-1 ml-1">*This message will be instantly sent to the Club President's mobile device via Twilio SMS.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                  Transmit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Leave Club Confirmation Modal ── */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsLeaveModalOpen(false)} />
          <div 
            className="relative w-full max-w-md bg-neutral-950 border border-rose-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-5 duration-500"
          >
            {/* Red Alert Beam */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-8 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                <AlertTriangle size={40} />
              </div>

              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-4">Departure Authorization</h2>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-10 italic">
                A request to leave <span className="text-white font-bold">{club?.name}</span> will be transmitted to the club leadership 
                for <span className="text-white font-bold">authorization</span>.
                <br/><br/>
                <span className="text-rose-400 font-bold uppercase tracking-widest text-[10px]">Process Update: </span>
                Just like joining, your departure must be <span className="text-emerald-400 font-bold italic underline underline-offset-4">approved by a leader</span> to finalize the transition.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="h-14 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all font-sans"
                >
                  Return
                </button>
                <button
                  onClick={handleLeaveClub}
                  disabled={isLeaving}
                  className="h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2 group font-sans"
                >
                  {isLeaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Yes, Leave
                      <LogOut size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
