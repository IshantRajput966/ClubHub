"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ClubCard } from "@/components/clubs/club-card"
import { ClubRequestModal } from "@/components/clubs/club-request-modal"
import { BookOpen, Plus, Search } from "lucide-react"

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

export default function ClubsPage() {
  const [clubs, setClubs]               = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [joinedClubs, setJoinedClubs]   = useState<Club[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [searchTerm, setSearchTerm]     = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [error, setError]               = useState<string | null>(null)
  const [userRole, setUserRole]         = useState("student")
  const [isModalOpen, setIsModalOpen]   = useState(false)

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
    <div className="relative flex h-screen w-full overflow-hidden text-white">
      {/* Sidebar container */}
      <div className="w-64 shrink-0 h-screen z-10">
        <Sidebar joinedClubs={userRole === "member" ? joinedClubs : []} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden z-0">

        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-white/5"
             style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Neural Catalog</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Active Organizations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userRole === "leader" && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold transition hover:scale-[1.02] shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> CREATE CLUB
              </button>
            )}
            {(userRole === "student" || userRole === "member") && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold transition hover:scale-[1.02] shadow-[0_0_20px_rgba(8,145,178,0.3)] flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> REQUEST NEW CLUB
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-10 py-6 border-b border-white/5"
             style={{ background: "rgba(0,0,0,0.1)", backdropFilter: "blur(8px)" }}>
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Search the neural network for clubs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all text-sm font-medium"
              />
            </div>
            <div className="flex gap-2 flex-wrap pb-1">
              {domains.map(domain => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-4 py-2 rounded-xl font-bold uppercase tracking-widest transition-all text-[10px] ${
                    selectedDomain === domain
                      ? "bg-purple-600/20 border border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      : "bg-white/[0.03] border border-white/5 text-gray-500 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {domain === "all" ? "AETHER" : domain}
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

      <ClubRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClubs}
        userRole={userRole}
      />
    </div>
  )
}
