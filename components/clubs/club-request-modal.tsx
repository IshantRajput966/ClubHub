"use client"

import { useState, useEffect } from "react"
import { 
  X, Loader2, Upload, ImageIcon, 
  Type, Layout, AlignLeft, UserCheck, Sparkles, Phone 
} from "lucide-react"

interface ClubRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userRole: string
}

export function ClubRequestModal({ isOpen, onClose, onSuccess, userRole }: ClubRequestModalProps) {
  const [facultyList, setFacultyList] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    domain: "tech",
    logoUrl: "",
    bannerUrl: "",
    facultyOverseer: "",
    phoneNumber: ""
  })

  const domains = ["tech", "sports", "arts", "science", "cultural", "music"]

  useEffect(() => {
    if (isOpen) {
      fetchFaculty()
    }
  }, [isOpen])

  const fetchFaculty = async () => {
    try {
      const res = await fetch("/api/faculty")
      if (res.ok) setFacultyList(await res.json())
    } catch (e) {}
  }

  const handleFileUpload = async (file: File, folder: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      return url
    } catch (e) {
      alert("Error uploading image")
      return null
    }
  }

  const handleRequestClub = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error("Failed to submit request")
      
      alert("Success! Your club proposal has been transmitted to hyperspace (and your faculty overseer).")
      onSuccess()
      onClose()
      setFormData({
        name: "",
        description: "",
        domain: "tech",
        logoUrl: "",
        bannerUrl: "",
        facultyOverseer: "",
        phoneNumber: ""
      })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => !isSubmitting && onClose()}
      />
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500"
        style={{ 
          background: "linear-gradient(145deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        {/* Top Glow Ornament */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[2px]" />

        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {userRole === "leader" ? "New Club Lab" : "Club Proposal"}
              </h2>
              <p className="text-xs text-purple-300 font-medium uppercase tracking-[0.2em] opacity-70">Initialize your community space</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleRequestClub} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Core Identity Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Type size={14} className="text-purple-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Identity</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group space-y-2">
                <label className="text-xs font-semibold text-gray-400 ml-1 group-focus-within:text-purple-400 transition-colors">Club Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <Type size={16} />
                  </div>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Robotics Hub"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-gray-600"
                  />
                </div>
              </div>
              <div className="group space-y-2">
                <label className="text-xs font-semibold text-gray-400 ml-1 group-focus-within:text-cyan-400 transition-colors">Operational Domain</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                    <Layout size={16} />
                  </div>
                  <select
                    value={formData.domain}
                    onChange={e => setFormData({...formData, domain: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all duration-300 appearance-none"
                  >
                    {domains.map(d => (
                      <option key={d} value={d} className="bg-neutral-900 capitalize">{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="group space-y-2">
              <label className="text-xs font-semibold text-gray-400 ml-1 group-focus-within:text-purple-400 transition-colors">Leader Phone (Twilio Hub)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Phone size={16} />
                </div>
                <input
                  required
                  type="text"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="+919999999999"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="group space-y-2">
              <label className="text-xs font-semibold text-gray-400 ml-1 group-focus-within:text-purple-400 transition-colors">Brief Description</label>
              <div className="relative">
                <div className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <AlignLeft size={16} />
                </div>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this club about? Goal and objectives..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300 resize-none placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Visual Assets Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} className="text-cyan-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Assets</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 ml-1">Brand Logo</label>
                <label className="relative flex flex-col items-center justify-center w-full h-36 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2rem] cursor-pointer hover:bg-purple-500/5 hover:border-purple-500/30 transition-all duration-500 overflow-hidden group/upload">
                  {formData.logoUrl ? (
                    <div className="relative w-full h-full">
                      <img src={formData.logoUrl} alt="logo preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                        <Upload className="text-white" size={24} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover/upload:scale-110 group-hover/upload:bg-purple-500/20 transition-all duration-300">
                        <Upload size={20} className="text-gray-500 group-hover/upload:text-purple-400" />
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PNG / JPG</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = await handleFileUpload(file, "logos")
                        if (url) setFormData({...formData, logoUrl: url})
                      }
                    }}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 ml-1">Stage Banner</label>
                <label className="relative flex flex-col items-center justify-center w-full h-36 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2rem] cursor-pointer hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden group/upload">
                  {formData.bannerUrl ? (
                    <div className="relative w-full h-full">
                      <img src={formData.bannerUrl} alt="banner preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                        <ImageIcon className="text-white" size={24} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover/upload:scale-110 group-hover/upload:bg-cyan-500/20 transition-all duration-300">
                        <ImageIcon size={20} className="text-gray-500 group-hover/upload:text-cyan-400" />
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Wide format</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = await handleFileUpload(file, "banners")
                        if (url) setFormData({...formData, bannerUrl: url})
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Oversight Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Leadership Oversight</span>
            </div>
            
            <div className="group space-y-2">
              <label className="text-xs font-semibold text-gray-400 ml-1 group-focus-within:text-emerald-400 transition-colors">Faculty Mentor</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                  <UserCheck size={16} />
                </div>
                <select
                  required
                  value={formData.facultyOverseer}
                  onChange={e => setFormData({...formData, facultyOverseer: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300 appearance-none"
                >
                  <option value="" className="bg-neutral-900">Select an overseer...</option>
                  {facultyList.map(f => (
                    <option key={f.username} value={f.username} className="bg-neutral-900 font-medium">{f.username} — {f.email}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-gray-500 ml-4 font-medium italic">Faculty will have full visibility into your club’s operations.</p>
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-[1.5rem] font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300 active:scale-95"
            >
              Withdraw
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] relative group overflow-hidden bg-white text-black px-8 py-4 rounded-[1.5rem] font-bold transition-all duration-300 active:scale-95 disabled:opacity-50"
              style={{ 
                boxShadow: "0 0 30px rgba(255,255,255,0.15)"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Transmitting...</>
                ) : (
                  <>
                    {userRole === "leader" ? "Initialize Club" : "Submit Proposal"}
                    <Sparkles size={16} className="text-purple-500 group-hover:text-white transition-colors" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
