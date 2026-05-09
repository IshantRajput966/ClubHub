"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Calendar, Users, Zap, Hash, ArrowRight, Command } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchItem {
  id: string
  title: string
  type: "club" | "event" | "action"
  url: string
  description?: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Toggle palette on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only allow opening if a user is logged in
      const isLogged = typeof window !== "undefined" && !!sessionStorage.getItem("username")
      
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        if (!isLogged) return
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Fetch initial data or search
  const performSearch = useCallback(async (searchTerm: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be a unified search endpoint
      // For now, we'll fetch from existing APIs and filter locally
      const [clubsRes, eventsRes] = await Promise.all([
        fetch("/api/clubs"),
        fetch("/api/events")
      ])
      
      const clubs = await clubsRes.json()
      const events = await eventsRes.json()

      const formattedClubs = clubs.map((c: any) => ({
        id: c.id,
        title: c.name,
        type: "club",
        url: `/clubs/${c.id}`,
        description: c.description
      }))

      const formattedEvents = events.map((e: any) => ({
        id: e.id,
        title: e.title,
        type: "event",
        url: "/events",
        description: e.description
      }))

      const staticActions: SearchItem[] = [
        { id: "act-1", title: "View Dashboard", type: "action", url: "/dashboard" },
        { id: "act-2", title: "Ask Aura Assistant", type: "action", url: "/matchmaker" },
        { id: "act-3", title: "My Profile", type: "action", url: "/profile" },
      ]

      const all = [...formattedClubs, ...formattedEvents, ...staticActions]
      
      const filtered = all.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)

      setResults(filtered)
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      performSearch(query)
      setSelectedIndex(0)
    }
  }, [query, isOpen, performSearch])

  const handleSelect = (item: SearchItem) => {
    router.push(item.url)
    setIsOpen(false)
    setQuery("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1))
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === "Enter") {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a14]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-top-2 duration-300 focus-within:ring-2 focus-within:ring-purple-500/50">
        
        {/* Search Input */}
        <div className="relative flex items-center border-b border-white/5 p-6">
          <Search className="w-6 h-6 text-purple-400 mr-4 opacity-50" />
          <input 
            autoFocus
            placeholder="Neural Search... (Clubs, Events, Aura Commands)"
            className="flex-1 bg-transparent text-xl font-medium outline-none text-white placeholder-white/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-500 font-bold uppercase">
             ESC
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-4 scrollbar-hide">
          {isLoading && query === "" ? (
             <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs uppercase tracking-widest font-black">Scanning Neural Network</p>
             </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center opacity-40">
               <Zap className="w-10 h-10 mx-auto mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest">No matching neural patterns found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left group
                    ${index === selectedIndex ? "bg-white/10 border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]" : "bg-transparent border border-transparent"}
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors
                    ${item.type === "club" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : 
                      item.type === "event" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : 
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}
                    ${index === selectedIndex ? "scale-110" : ""}
                  `}>
                    {item.type === "club" ? <Users size={18} /> : 
                     item.type === "event" ? <Calendar size={18} /> : 
                     <Zap size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border
                         ${item.type === "club" ? "border-blue-500/30 text-blue-300 bg-blue-500/10" :
                           item.type === "event" ? "border-purple-500/30 text-purple-300 bg-purple-500/10" :
                           "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"}
                       `}>
                          {item.type}
                       </span>
                       <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 truncate mt-1 line-clamp-1 italic">{item.description}</p>
                    )}
                  </div>
                  <ArrowRight size={14} className={`text-white/20 transition-all ${index === selectedIndex ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-white/5 border-t border-white/5">
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-black/40 text-[9px] font-bold">↑↓</kbd>
                 <span className="text-[9px] text-gray-500 uppercase font-bold">Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                 <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-black/40 text-[9px] font-bold">ENTER</kbd>
                 <span className="text-[9px] text-gray-500 uppercase font-bold">Select</span>
              </div>
           </div>
           <div className="flex items-center gap-2 opacity-30">
              <Command size={10} className="text-purple-400" />
              <span className="text-[8px] font-black uppercase tracking-tighter">Powered by Aura Intelligence</span>
           </div>
        </div>
      </div>
    </div>
  )
}
