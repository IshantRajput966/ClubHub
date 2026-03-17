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
    <div className="flex h-screen bg-transparent">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Bell size={20} className="text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Announcements</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  {canManage ? "Post and manage club announcements" : "Stay updated with your clubs"}
                </p>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition text-sm"
              >
                <Plus className="w-4 h-4" /> New Announcement
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(["all", "pinned", "club"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition capitalize ${
                  filter === f
                    ? "bg-purple-600 text-white border-purple-500"
                    : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
                style={filter !== f ? { background: "rgba(255,255,255,0.05)" } : {}}
              >
                {f === "all" ? "All" : f === "pinned" ? "📌 Pinned" : "🏛️ Club"}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-500 self-center">
              {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-300 text-sm">{error}</div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 text-gray-400 py-20">
              <Loader2 size={20} className="animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="font-medium text-white">
                {filter === "pinned" ? "No pinned announcements" :
                 filter === "club"   ? "No club announcements" :
                 "No announcements yet"}
              </p>
              {canManage && filter === "all" && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-purple-400 hover:text-purple-300 text-sm transition"
                >
                  Create the first announcement →
                </button>
              )}
            </div>
          ) : (
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
