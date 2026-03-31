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
    <div className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl">
      <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl overflow-hidden border border-white/5 flex flex-col">
        {/* Image — auto-generated if no imageUrl */}
        <div className="w-full h-40 overflow-hidden relative border-b border-white/5">
          {autoImage ? (
            <img src={autoImage} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : imgLoading ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-violet-900/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[8px] text-purple-300 font-bold uppercase tracking-widest">Generating Neural Asset</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-violet-600/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          {domain && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-purple-300">
              {domain}
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-lg font-black text-white leading-tight mb-2 group-hover:text-purple-300 transition-colors uppercase tracking-tight line-clamp-1">{title}</h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2 italic">"{description}"</p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Temporal</span>
                <span className="text-[10px] font-bold text-gray-300">{formattedDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-blue-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Location</span>
                <span className="text-[10px] font-bold text-gray-300 truncate">{location}</span>
              </div>
            </div>
          </div>

          {/* RSVP buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => handleRsvp("going")}
              className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                rsvp === "going"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                  : "bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {rsvp === "going" ? "Synchronized" : "Go Secure"}
            </button>
            <button
              onClick={() => handleRsvp("interested")}
              className={`w-12 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                rsvp === "interested"
                  ? "bg-pink-600/20 border border-pink-500/50 text-pink-400 shadow-[0_0_15px_rgba(219,39,119,0.2)]"
                  : "bg-white/[0.03] border border-white/5 text-gray-700 hover:text-pink-400 hover:border-pink-500/30"
              }`}
            >
              <Heart size={16} fill={rsvp === "interested" ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
