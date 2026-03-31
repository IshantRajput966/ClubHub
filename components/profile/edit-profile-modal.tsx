"use client"

import { useState, useEffect } from "react"
import { X, Upload, Trash2, CheckCircle, Loader2 } from "lucide-react"

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  currentUsername: string
  currentBio: string
  currentProfilePic: string | null
  onSave: (data: { username: string; bio: string; profilePic: string | null }) => void
}

export default function EditProfileModal({
  open,
  onClose,
  currentUsername,
  currentBio,
  currentProfilePic,
  onSave,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername)
  const [bio, setBio] = useState(currentBio)
  const [profilePic, setProfilePic] = useState<string | null>(currentProfilePic)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setUsername(currentUsername)
      setBio(currentBio)
      setProfilePic(currentProfilePic)
    }
  }, [open, currentUsername, currentBio, currentProfilePic])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfilePic(event.target?.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty")
      return
    }

    setLoading(true)
    // Simulate a small delay for premium feel
    await new Promise(r => setTimeout(r, 800))
    onSave({ username: username.trim(), bio: bio.trim(), profilePic })
    setLoading(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-6">
      <div 
        className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl w-full max-w-[580px] animate-in fade-in zoom-in duration-300"
      >
        <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl overflow-hidden border border-white/5 flex flex-col shadow-inner">

          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Modify Identity</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Neural Profile Configuration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-10 py-8 space-y-8 max-h-[70vh]">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}

            {/* Profile Pic Segment */}
            <div className="flex flex-col items-center gap-6">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest self-start px-1">Visual Signature</span>
              <div className="relative group/avatar">
                <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-purple-500 to-blue-600 p-0.5 shadow-2xl">
                  <div className="w-full h-full rounded-[30px] bg-black flex items-center justify-center overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110 duration-500" />
                    ) : (
                      <span className="text-4xl font-black italic text-white uppercase tracking-tighter opacity-50">{username.charAt(0)}</span>
                    )}
                  </div>
                </div>
                
                <div className="absolute -bottom-2 -right-2 flex gap-2">
                  <label className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer border-2 border-black border-inset bg-clip-border">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <Upload size={18} />
                  </label>
                  {profilePic && (
                    <button 
                      onClick={() => setProfilePic(null)}
                      className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md text-rose-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-white/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Recommended: 1:1 Aspect Ratio • Max 2MB</p>
            </div>

            {/* Username Input */}
            <div className="space-y-3">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">Neural Alias</span>
              <input
                type="text"
                className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-[20px] outline-none text-white focus:bg-white/[0.05] focus:border-purple-500/30 transition-all font-black uppercase italic tracking-tighter"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="USERNAME_STUB"
              />
            </div>

            {/* Bio Input */}
            <div className="space-y-3">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">Origin Narrative</span>
              <textarea
                className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-[20px] outline-none text-white placeholder-gray-700 focus:bg-white/[0.05] focus:border-blue-500/30 transition-all font-medium italic text-sm leading-relaxed resize-none min-h-[120px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about your mission..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-10 py-8 border-t border-white/5 flex items-center justify-between bg-black/20">
            <button
              onClick={onClose}
              className="px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="h-12 px-10 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-[0_0_25px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:grayscale flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                "Save Identity"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
