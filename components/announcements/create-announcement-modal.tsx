"use client"

import { useState, useEffect, useRef } from "react"
import { X, Bell, Loader2, CheckCircle, ImageIcon, Pin, Calendar, Globe, BookMarked } from "lucide-react"

interface Props {
  isOpen:   boolean
  onClose:  () => void
  onCreate: (data: any) => Promise<void>
}

export function CreateAnnouncementModal({ isOpen, onClose, onCreate }: Props) {
  const [form, setForm] = useState({
    title:     "",
    content:   "",
    expiresAt: "",
    clubId:    "",
    pinned:    false,
  })
  const [myClubs, setMyClubs]       = useState<any[]>([])
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const fileRef                     = useRef<HTMLInputElement>(null)
  const username                    = typeof window !== "undefined" ? sessionStorage.getItem("username") ?? "" : ""
  const role                        = typeof window !== "undefined" ? sessionStorage.getItem("role") ?? "" : ""

  useEffect(() => {
    if (!isOpen) return
    fetch("/api/clubs")
      .then(r => r.json())
      .then((clubs: any[]) => {
        const mine = clubs.filter(c =>
          c.members?.some((m: any) =>
            m.username === username && ["president", "officer"].includes(m.role)
          )
        )
        setMyClubs(mine)
        if (mine.length === 1) setForm(f => ({ ...f, clubId: mine[0].id }))
      })
      .catch(() => {})
  }, [isOpen])

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null
    const data = new FormData()
    data.append("file", imageFile)
    data.append("folder", "announcements")
    const res = await fetch("/api/upload", { method: "POST", body: data })
    if (!res.ok) return null
    return (await res.json()).url
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const imageUrl = await uploadImage()
      await onCreate({
        title:     form.title.trim(),
        content:   form.content.trim(),
        author:    username,
        imageUrl,
        expiresAt: form.expiresAt || null,
        clubId:    form.clubId || null,
        pinned:    form.pinned,
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setForm({ title: "", content: "", expiresAt: "", clubId: "", pinned: false })
        setImageFile(null)
        setImagePreview(null)
        onClose()
      }, 1500)
    } catch {
      setError("Failed to create announcement.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border border-white/15 shadow-2xl overflow-hidden"
           style={{ background: "rgba(10,6,30,0.98)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Bell size={16} className="text-purple-300" />
            </div>
            <div>
              <h2 className="font-bold text-white">New Announcement</h2>
              <p className="text-xs text-gray-400 mt-0.5">Will be emailed to club members</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-12">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <p className="text-white font-bold text-xl">Announcement Posted!</p>
            <p className="text-gray-400 text-sm text-center">Members have been notified via email.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => update("title", e.target.value)}
                  placeholder="e.g., HackIIST 2026 Registrations Open!"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={e => update("content", e.target.value)}
                  placeholder="Write your announcement here..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Image (optional)
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-white/15 hover:border-purple-500/50 cursor-pointer transition overflow-hidden relative"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <p className="text-white text-xs font-medium">Click to change</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <ImageIcon size={18} className="text-gray-500" />
                      <p className="text-gray-500 text-xs">Click to upload image</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </div>
              </div>

              {/* Club selector + Expiry side by side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Club */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <BookMarked size={10} /> Club
                  </label>
                  <select
                    value={form.clubId}
                    onChange={e => update("clubId", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition appearance-none"
                  >
                    <option value="" className="bg-slate-900">
                      {role === "faculty" ? "All clubs (global)" : "Select club"}
                    </option>
                    {myClubs.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={10} /> Expires
                  </label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={e => update("expiresAt", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Pin toggle */}
              <div
                onClick={() => update("pinned", !form.pinned)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  form.pinned ? "border-yellow-500/40 bg-yellow-500/10" : "border-white/10 hover:border-white/20 bg-white/5"
                }`}
              >
                <Pin size={16} className={form.pinned ? "text-yellow-300" : "text-gray-400"} />
                <div>
                  <p className={`text-sm font-medium ${form.pinned ? "text-yellow-300" : "text-gray-300"}`}>
                    Pin this announcement
                  </p>
                  <p className="text-xs text-gray-500">Pinned announcements appear at the top</p>
                </div>
                <div className={`ml-auto w-10 h-5 rounded-full transition-colors ${form.pinned ? "bg-yellow-500" : "bg-white/20"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${form.pinned ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>

              {/* Email notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Globe size={14} className="text-blue-300 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-300">
                  {form.clubId
                    ? "Email notification will be sent to all members of the selected club."
                    : "Email notification will be sent to all members and leaders across all clubs."}
                </p>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Posting...</> : "📢 Post Announcement"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
