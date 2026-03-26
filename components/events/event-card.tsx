"use client"

import { useState } from "react"
import { useAutoImage } from "@/lib/hooks/use-auto-image"
import { Calendar, MapPin, Users, Heart, Share2, Clock } from "lucide-react"

interface EventCardProps {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  organizer: string
  capacity: number
  attendees: Array<{ id: string; username: string; status: string }>
  imageUrl?: string
  domain?: string
  onRsvp?: (eventId: string, status: string) => void
}

export function EventCard({
  id, title, description, date, time, location,
  organizer, capacity, attendees, imageUrl, domain, onRsvp,
}: EventCardProps) {
  const { src: autoImage, loading: imgLoading } = useAutoImage({ imageUrl, title, description, domain, id })
  const [isLiked, setIsLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [rsvp, setRsvp]           = useState<"going" | "interested" | null>(null)

  const attendeeCount = attendees.length

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleRsvp = (status: "going" | "interested") => {
    setRsvp(rsvp === status ? null : status)
    onRsvp?.(id, status)
  }

  const formattedDate = (() => {
    try {
      return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    } catch { return date }
  })()

  return (
    <div className="rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 overflow-hidden"
         style={{ background: "rgba(10,5,30,0.7)", backdropFilter: "blur(12px)" }}>

      {/* Image — auto-generated if no imageUrl */}
      <div className="w-full h-32 overflow-hidden relative">
        {autoImage ? (
          <img src={autoImage} alt={title} className="w-full h-full object-cover" />
        ) : imgLoading ? (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-violet-900/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-purple-300">Generating image...</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-violet-600/30" />
        )}
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-bold text-white leading-tight mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{description}</p>

        {/* Details */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Calendar size={11} className="text-purple-400 shrink-0" />
            <span>{formattedDate}</span>
            <Clock size={11} className="text-purple-400 shrink-0 ml-1" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <MapPin size={11} className="text-purple-400 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Users size={11} className="text-purple-400 shrink-0" />
            <span>{attendeeCount}/{capacity} going</span>
            <span className="text-gray-600 mx-1">·</span>
            <span className="text-purple-400">by {organizer}</span>
          </div>
        </div>

        {/* RSVP buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleRsvp("going")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              rsvp === "going"
                ? "bg-purple-600 text-white"
                : "bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30"
            }`}
          >
            {rsvp === "going" ? "✓ Going" : "Going"}
          </button>
          <button
            onClick={() => handleRsvp("interested")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              rsvp === "interested"
                ? "bg-white/20 text-white border border-white/30"
                : "border border-white/15 text-gray-400 hover:bg-white/5"
            }`}
          >
            {rsvp === "interested" ? "✓ Interested" : "Interested"}
          </button>
        </div>

        {/* Social */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <button onClick={handleLike} className={`flex items-center gap-1 text-xs transition ${isLiked ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}>
            <Heart size={13} fill={isLiked ? "currentColor" : "none"} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition ml-auto">
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
