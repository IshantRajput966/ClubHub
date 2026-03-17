"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ClubCard } from "@/components/clubs/club-card"
import { BookOpen, Plus, Search } from "lucide-react"

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

export default function ClubsPage() {
  const [clubs, setClubs]               = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [joinedClubs, setJoinedClubs]   = useState<Club[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [searchTerm, setSearchTerm]     = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [error, setError]               = useState<string | null>(null)
  const [userRole, setUserRole]         = useState("student")

  const domains = ["all", "tech", "sports", "arts", "science", "cultural", "music"]

  useEffect(() => {
    fetchClubs()
    fetchUserClubs()
    setUserRole(sessionStorage.getItem("role") || "student")
  }, [])

  useEffect(() => {
    filterClubs()
  }, [clubs, searchTerm, selectedDomain])

  const fetchClubs = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/clubs")
      if (!res.ok) throw new Error("Failed")
      setClubs(await res.json())
      setError(null)
    } catch {
      setError("Failed to load clubs")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserClubs = async () => {
    try {
      const res = await fetch("/api/user/clubs")
      if (!res.ok) return
      setJoinedClubs(await res.json())
    } catch {}
  }

  const filterClubs = () => {
    let filtered = clubs
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedDomain !== "all") {
      filtered = filtered.filter(c => c.domain.toLowerCase() === selectedDomain)
    }
    setFilteredClubs(filtered)
  }

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar joinedClubs={userRole === "member" ? joinedClubs : []} />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10"
             style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Clubs</h1>
          </div>
          {(userRole === "leader" || userRole === "faculty") && (
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition">
              <Plus className="w-5 h-5" /> Create Club
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="px-8 py-4 border-b border-white/10"
             style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(8px)" }}>
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-sm"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {domains.map(domain => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition capitalize text-sm ${
                    selectedDomain === domain
                      ? "bg-purple-600 text-white"
                      : "border border-white/15 text-gray-300 hover:border-purple-500"
                  }`}
                  style={selectedDomain !== domain ? { background: "rgba(255,255,255,0.05)" } : {}}
                >
                  {domain === "all" ? "All Clubs" : domain}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clubs Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">{error}</div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">{clubs.length === 0 ? "No clubs yet" : "No clubs match your search"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map(club => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
