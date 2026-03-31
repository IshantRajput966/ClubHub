"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { AnnouncementCard } from "@/components/announcements/announcement-card"
import { CreateAnnouncementModal } from "@/components/announcements/create-announcement-modal"
import { Bell, Plus, Loader2, Filter } from "lucide-react"

interface Announcement {
  id:        string
  title:     string
  content:   string
  author:    string
  imageUrl?: string
  createdAt: string
  expiresAt?: string
  clubId?:   string
  clubName?: string
  pinned?:   number | boolean
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [isModalOpen, setIsModalOpen]     = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [role, setRole]                   = useState<string | null>(null)
  const [filter, setFilter]               = useState<"all" | "pinned" | "club">("all")

  useEffect(() => {
    setRole(sessionStorage.getItem("role"))
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/announcements")
      if (!res.ok) throw new Error("Failed")
      setAnnouncements(await res.json())
      setError(null)
    } catch {
      setError("Failed to load announcements")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    const res = await fetch("/api/announcements", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed")
    const newAnn = await res.json()
    setAnnouncements(prev => [newAnn, ...prev])
  }

  const handleDismiss = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const handlePin = (id: string, pinned: boolean) => {
    setAnnouncements(prev =>
      [...prev.map(a => a.id === id ? { ...a, pinned } : a)]
        .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    )
  }

  const canManage = role === "leader" || role === "faculty"

  const filtered = announcements.filter(a => {
    if (filter === "pinned") return Boolean(a.pinned)
    if (filter === "club")   return Boolean(a.clubId)
    return true
  })

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white">
      <Sidebar />

      <div className="flex-1 overflow-y-auto scrollbar-hide z-0">
        <div className="max-w-3xl mx-auto p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Bell size={24} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Neural Broadcast</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  {canManage ? "Transmit Global Updates" : "Synchronized Feed"}
                </p>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold transition hover:scale-[1.02] shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> BROADCAST
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
              {(["all", "pinned", "club"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                    filter === f
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {f === "all" ? "Universe" : f === "pinned" ? "Critical" : "Entities"}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                {filtered.length} ACTIVE
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-300 text-sm">{error}</div>
          )}

          {/* No results */}
          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[31px]">
              <Bell className="w-16 h-16 mx-auto mb-6 text-gray-800" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">Null Signal</h2>
              <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto mb-8">
                {filter === "pinned" ? "No critical priority packets found in the neural cache." :
                 "No broadcasting signals detected on this frequency."}
              </p>
              {canManage && filter === "all" && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="h-10 px-6 rounded-xl bg-white/[0.03] border border-white/10 text-purple-400 font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.08] transition-all"
                >
                  Initiate First Broadcast →
                </button>
              )}
            </div>
          )}
          {/* Results */}
          {filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map(ann => (
                <AnnouncementCard
                  key={ann.id}
                  {...ann}
                  canManage={canManage}
                  onDismiss={handleDismiss}
                  onPin={handlePin}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {canManage && (
        <CreateAnnouncementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
