"use client"

import { useState } from "react"
import { Pin, Trash2, Clock, User, BookMarked, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AnnouncementCardProps {
  id:         string
  title:      string
  content:    string
  author:     string
  imageUrl?:  string
  createdAt:  string
  expiresAt?: string
  clubId?:    string
  clubName?:  string
  pinned?:    number | boolean
  onDismiss?: (id: string) => void
  onPin?:     (id: string, pinned: boolean) => void
  canManage?: boolean
}

export function AnnouncementCard({
  id, title, content, author, imageUrl, createdAt,
  expiresAt, clubId, clubName, pinned, onDismiss, onPin, canManage
}: AnnouncementCardProps) {
  const [expanded, setExpanded]   = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const isPinned = Boolean(pinned)

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(createdAt), { addSuffix: true }) }
    catch { return createdAt }
  })()

  const expiryLabel = (() => {
    if (!expiresAt) return null
    try {
      const d = new Date(expiresAt)
      const now = new Date()
      if (d < now) return "Expired"
      return `Expires ${formatDistanceToNow(d, { addSuffix: true })}`
    } catch { return null }
  })()

  const isLong = content.length > 200

  async function handleDelete() {
    if (!confirm("Delete this announcement?")) return
    setDeleting(true)
    try {
      await fetch(`/api/announcements/${id}`, { method: "DELETE" })
      onDismiss?.(id)
    } catch {}
    setDeleting(false)
  }

  async function handlePin() {
    try {
      await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !isPinned }),
      })
      onPin?.(id, !isPinned)
    } catch {}
  }

  return (
    <div className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${
      isPinned ? "border-yellow-500/40" : "border-white/10 hover:border-white/20"
    }`}
    style={{ background: isPinned ? "rgba(234,179,8,0.06)" : "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>

      {/* Pinned strip */}
      {isPinned && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-yellow-500/15 border-b border-yellow-500/20">
          <Pin size={11} className="text-yellow-400" />
          <span className="text-yellow-300 text-xs font-semibold">Pinned Announcement</span>
        </div>
      )}

      {/* Banner image */}
      {imageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {clubName && (
            <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
              <BookMarked size={9} /> {clubName}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <User size={10} /> {author}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={10} /> {timeAgo}
          </span>
          {expiryLabel && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              expiryLabel === "Expired"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-blue-500/10 text-blue-300 border-blue-500/20"
            }`}>
              {expiryLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-base mb-2 leading-snug">{title}</h3>

        {/* Content */}
        <p className={`text-gray-300 text-sm leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
          {content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2 transition"
          >
            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
          </button>
        )}

        {/* Actions — only for leaders/faculty */}
        {canManage && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={handlePin}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
                isPinned
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30"
                  : "bg-white/5 text-gray-400 border-white/10 hover:text-yellow-300 hover:border-yellow-500/30"
              }`}
            >
              <Pin size={11} /> {isPinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition ml-auto"
            >
              <Trash2 size={11} /> {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
