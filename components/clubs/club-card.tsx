"use client"

import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"
import { useAutoImage } from "@/lib/hooks/use-auto-image"

interface Club {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  bannerUrl?: string
  createdBy: string
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

  const getDomainBadge = (domain: string) => {
    const map: Record<string, string> = {
      tech:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
      sports:   "bg-green-500/20 text-green-300 border-green-500/30",
      arts:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
      science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      music:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
    }
    return map[domain?.toLowerCase()] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  return (
    <Link href={`/clubs/${club.id}`}>
      <div className="rounded-xl border border-purple-500/20 hover:border-purple-500/50 overflow-hidden transition-all duration-300 cursor-pointer group h-full" style={{ background: "rgba(10,5,30,0.7)", backdropFilter: "blur(12px)" }}>

        {/* Banner */}
        <div className="w-full h-40 overflow-hidden relative">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={club.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : bannerLoading ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-violet-900/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-purple-300">Generating image...</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30" />
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            {club.logoUrl && (
              <img src={club.logoUrl} alt={club.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            )}
            <div>
              <h3 className="text-base font-bold text-white">{club.name}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getDomainBadge(club.domain)}`}>
                {club.domain}
              </span>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{club.description}</p>

          <div className="flex gap-4 mb-4 pb-4 border-b border-purple-500/20 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-purple-400" />
              {club.members.length} {club.members.length === 1 ? "member" : "members"}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">By {club.createdBy}</span>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
