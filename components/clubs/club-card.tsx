"use client"

import Link from "next/link"
import { Users, ArrowRight, Crown, Globe, Clock } from "lucide-react"
import { useAutoImage } from "@/lib/hooks/use-auto-image"

interface Club {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  bannerUrl?: string
  createdBy: string
  status: string
  members: Array<{ username: string; role: string }>
  events: Array<any>
}

export function ClubCard({ club }: { club: Club }) {
  const { src: bannerSrc, loading: bannerLoading } = useAutoImage({
    imageUrl:    club.bannerUrl,
    title:       club.name,
    description: club.description,
    domain:      club.domain,
    id:          `club-${club.id}`,
  })

  // Find the president or default to the creator
  const president = club.members.find(m => m.role === "president")?.username || club.createdBy
  const isPending = club.status === "pending"

  const getDomainBadge = (domain: string) => {
    const map: Record<string, string> = {
      tech:     "bg-blue-500/20 text-blue-300 border-blue-500/40",
      sports:   "bg-green-500/20 text-green-300 border-green-500/40",
      arts:     "bg-pink-500/20 text-pink-300 border-pink-500/40",
      science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      cultural: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      music:    "bg-purple-500/20 text-purple-300 border-purple-500/40",
    }
    return map[domain?.toLowerCase()] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  return (
    <Link href={`/clubs/${club.id}`}>
      <div className={`relative flex flex-col h-full rounded-[31px] border transition-all duration-500 group overflow-hidden
        ${isPending ? "border-yellow-500/20 bg-yellow-500/5 shadow-yellow-500/5" : "border-white/5 bg-black/60 hover:border-purple-500/30 shadow-2xl hover:shadow-purple-500/10"}
      `} style={{ backdropFilter: "blur(40px)" }}>
        
        {/* Banner with status glass overlay */}
        <div className="w-full h-44 overflow-hidden relative">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={club.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : bannerLoading ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isPending && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                <Clock size={10} className="animate-pulse" /> Pending
              </div>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${getDomainBadge(club.domain)}`}>
              {club.domain}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 relative">
          {/* Logo overlapping banner */}
          <div className="absolute -top-10 left-6 w-20 h-20 rounded-3xl border-2 border-white/10 bg-[#010109] p-1.5 shadow-2xl group-hover:-translate-y-2 transition-transform duration-300">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-purple-500/10 flex items-center justify-center font-bold text-2xl text-purple-400">
              {club.logoUrl ? <img src={club.logoUrl} alt="" className="w-full h-full object-cover" /> : club.name[0]}
            </div>
          </div>

          <div className="mt-10 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{club.name}</h3>
              {!isPending && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />}
            </div>
            <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed h-10">{club.description}</p>
          </div>

          <div className="mt-auto space-y-4">
            {/* President Section */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 transition-colors group-hover:bg-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Crown size={14} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">President</span>
                  <span className="text-sm font-semibold text-gray-200">{president}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-[10px] font-bold">
                 Leader
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 group/stat">
                  <Users size={14} className="text-purple-400" />
                  <span className="text-sm font-medium text-gray-300 group-hover/stat:text-white">{club.members.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={13} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Public</span>
                </div>
              </div>
              <div className="flex items-center gap-1 transform group-hover:translate-x-1 transition-transform">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Connect</span>
                <ArrowRight size={14} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
