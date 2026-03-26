"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Calendar, Share2, UserPlus, ArrowLeft, Clock, CheckCircle, Loader2 } from "lucide-react"
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

type JoinState = "none" | "pending" | "member" | "sending"

export default function ClubDetailPage() {
  const params  = useParams()
  const clubId  = params?.id as string

  const [club, setClub]           = useState<ClubDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [joinState, setJoinState] = useState<JoinState>("none")
  const [username, setUsername]   = useState<string | null>(null)

  useEffect(() => {
    const user = sessionStorage.getItem("username")
    setUsername(user)
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

      // Check if there's a pending/approved request
      const reqRes  = await fetch(`/api/join-requests?username=${user}`)
      const reqData = await reqRes.json()
      const myReq   = reqData.find((r: any) => r.clubId === clubId)

      if (myReq?.status === "pending")  setJoinState("pending")
      else if (myReq?.status === "approved") setJoinState("member")
      else setJoinState("none")

      setError(null)
    } catch (err) {
      setError("Failed to load club details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!username || !clubId) return
    setJoinState("sending")
    try {
      const res = await fetch("/api/join-requests", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clubId, username }),
      })
      if (res.status === 409) {
        // Already pending or member
        setJoinState("pending")
        return
      }
      if (!res.ok) throw new Error("Failed")
      setJoinState("pending")
    } catch {
      setJoinState("none")
    }
  }

  // ── Join button rendering ─────────────────────────────────────────────────

  function JoinButton() {
    if (joinState === "member") {
      return (
        <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-5 h-5" />
          Joined
        </div>
      )
    }

    if (joinState === "pending") {
      return (
        <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-yellow-600/20 text-yellow-300 border border-yellow-500/30">
          <Clock className="w-5 h-5" />
          Request Pending
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
        onClick={handleJoin}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
      >
        <UserPlus className="w-5 h-5" />
        Join Club
      </button>
    )
  }

  // ── Loading / error states ────────────────────────────────────────────────

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

      <div className="flex-1 overflow-y-auto">
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

            {/* Only show join button if not the club's own president */}
            {username !== club.createdBy && <JoinButton />}
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

          {/* Events */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Events ({eventCount})</h2>
            {eventCount === 0 ? (
              <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-8 text-center text-gray-400">
                No events scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {club.events.map(clubEvent => (
                  <div key={clubEvent.event.id} className="bg-slate-900 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/50 transition-colors">
                    <h3 className="text-lg font-bold text-white mb-2">{clubEvent.event.title}</h3>
                    <p className="text-gray-300 mb-4">{clubEvent.event.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                      <div>
                        <p className="font-semibold text-gray-300">Date & Time</p>
                        <p>{clubEvent.event.date} at {clubEvent.event.time}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">Location</p>
                        <p>{clubEvent.event.location}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">Capacity</p>
                        <p>{clubEvent.event.attendees.length} / {clubEvent.event.capacity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
