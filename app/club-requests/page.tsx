"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { 
  CheckCircle, XCircle, Clock, Users, Globe, 
  ChevronRight, Loader2, AlertCircle, Shield
} from "lucide-react"

interface Member {
  username: string
  role: string
}

interface ClubRequest {
  id: string
  name: string
  description: string
  domain: string
  logoUrl?: string
  bannerUrl?: string
  status: string
  facultyOverseer?: string
  createdBy: string
  createdAt: string
  members: Member[]
}

const domainColors: Record<string, string> = {
  tech:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  sports:   "bg-green-500/20 text-green-300 border-green-500/30",
  arts:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
  science:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  cultural: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  music:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

export default function ClubRequestsPage() {
  const [requests, setRequests] = useState<ClubRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [acting, setActing]     = useState<string | null>(null)
  const [role, setRole]         = useState<string | null>(null)

  useEffect(() => {
    const r = sessionStorage.getItem("role")
    setRole(r)
    if (r !== "faculty") { setLoading(false); return }
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/clubs?status=pending")
      if (res.ok) {
        setRequests(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (clubId: string, status: "approved" | "rejected") => {
    setActing(clubId)
    try {
      const res = await fetch(`/api/clubs/${clubId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== clubId))
      } else {
        alert("Action failed")
      }
    } catch (e) {
      alert("Error processing request")
    } finally {
      setActing(null)
    }
  }

  if (role !== "faculty") {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Shield size={48} className="text-gray-700 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Faculty Access Only</h1>
          <p className="text-gray-500 max-w-sm">You must be logged in as a faculty member to manage club requests.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto scrollbar-hide z-0 p-10">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Charter Proposals</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Formation Approval Terminal</p>
              </div>
            </div>
            <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent transition-all shadow-xl">
              <div className="bg-black/40 backdrop-blur-3xl border border-white/5 px-4 py-2 rounded-[14px] flex items-center gap-2 shadow-inner">
                <Clock size={16} className="text-purple-400" />
                <span className="text-purple-300 font-black text-[10px] uppercase tracking-widest">{requests.length} Pending Sequence{requests.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 rounded-full border-t-2 border-purple-500 animate-spin" />
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest animate-pulse">Scanning Proposal Buffer...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
              <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-20 border border-white/5 text-center shadow-inner">
                <div className="w-20 h-20 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-gray-700" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase mb-2">Protocol Optimal</h3>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">No pending formation requests detected in the current cycle.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {requests.map(req => (
                <div 
                  key={req.id}
                  className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.011] shadow-2xl"
                >
                  <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl overflow-hidden border border-white/5 flex flex-col md:flex-row shadow-inner">
                    
                    {/* Visual Segment */}
                    <div className="w-full md:w-72 h-48 md:h-auto relative bg-black/20 shrink-0 border-r border-white/5">
                      {req.bannerUrl ? (
                        <img src={req.bannerUrl} alt="banner" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-black" />
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center p-1 shadow-2xl">
                          <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-purple-600 to-blue-600 p-0.5">
                            <div className="w-full h-full rounded-[18px] bg-black flex items-center justify-center text-3xl font-black italic text-white">
                              {req.logoUrl ? (
                                <img src={req.logoUrl} alt="logo" className="w-full h-full rounded-[18px] object-cover" />
                              ) : (
                                req.name[0]
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 left-4">
                        <div className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${domainColors[req.domain] || 'bg-white/5 border-white/10 text-gray-500'} bg-black/40 backdrop-blur-md`}>
                          {req.domain}
                        </div>
                      </div>
                    </div>

                    {/* Meta Segment */}
                    <div className="flex-1 p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-6 mb-4">
                          <div>
                            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic group-hover:text-purple-400 transition-colors">{req.name}</h2>
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mt-1 italic">Initiator: @{req.createdBy}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-tighter">Temporal Origin</p>
                            <p className="text-[10px] font-bold text-gray-400 tabular-nums">{new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="relative px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl mb-8 italic text-gray-400 text-sm leading-relaxed">
                          "{req.description}"
                        </div>

                        <div className="flex flex-wrap gap-6 items-center">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                            <Users size={12} className="text-purple-500" />
                            <span>Creator as President</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                            <Globe size={12} className="text-cyan-500" />
                            <span className="capitalize">{req.domain} Domain</span>
                          </div>
                        </div>
                      </div>

                      {/* Control Interlock */}
                      <div className="mt-10 flex items-center justify-end gap-4 pt-8 border-t border-white/5">
                        <button 
                          disabled={!!acting}
                          onClick={() => handleAction(req.id, "rejected")}
                          className="h-12 px-8 rounded-[20px] bg-white/[0.03] border border-white/10 text-rose-500 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-rose-500/10 hover:border-rose-500/30 flex items-center gap-2 disabled:opacity-50"
                        >
                          {acting === req.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={18} />}
                          Abort Formation
                        </button>
                        <button 
                          disabled={!!acting}
                          onClick={() => handleAction(req.id, "approved")}
                          className="h-12 px-10 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-700 hover:scale-105 transition-all text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:opacity-50"
                        >
                          {acting === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                          Authorize Charter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
