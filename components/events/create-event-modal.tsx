"use client"

import { useState, useEffect, useRef } from "react"
import { X, Calendar, Clock, MapPin, Users, Upload, ImageIcon, Sparkles, ChevronDown, Loader2, CheckCircle } from "lucide-react"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (eventData: any) => void
}

const DOMAINS = [
  { value: "tech",     label: "Technology",  color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { value: "sports",   label: "Sports",      color: "bg-green-500/20 text-green-300 border-green-500/40" },
  { value: "cultural", label: "Cultural",    color: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  { value: "science",  label: "Science",     color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
  { value: "music",    label: "Music",       color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  { value: "arts",     label: "Arts",        color: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
  { value: "other",    label: "Other",       color: "bg-gray-500/20 text-gray-300 border-gray-500/40" },
]

export function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    date:        "",
    time:        "",
    location:    "",
    capacity:    "50",
    domain:      "",
    clubId:      "",
  })
  const [myClubs, setMyClubs]         = useState<any[]>([])
  const [imageFile, setImageFile]     = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [dragOver, setDragOver]       = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const username = typeof window !== "undefined" ? sessionStorage.getItem("username") ?? "" : ""
  const role     = typeof window !== "undefined" ? sessionStorage.getItem("role") ?? "" : ""

  useEffect(() => {
    if (!isOpen) return
    // Fetch clubs this user leads
    fetch("/api/clubs")
      .then(r => r.json())
      .then((clubs: any[]) => {
        const mine = clubs.filter(c =>
          c.members?.some((m: any) => m.username === username && ["president", "officer"].includes(m.role))
        )
        setMyClubs(mine)
        if (mine.length === 1) setForm(f => ({ ...f, clubId: mine[0].id }))
      })
      .catch(() => {})
  }, [isOpen, username])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null
    const data = new FormData()
    data.append("file", imageFile)
    data.append("folder", "events")
    const res = await fetch("/api/upload", { method: "POST", body: data })
    if (!res.ok) return null
    const json = await res.json()
    return json.url
  }

  async function handleSubmit() {
    if (!form.title || !form.description || !form.date || !form.time || !form.location) {
      setError("Please fill in all required fields.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let imageUrl: string | null = null
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage()
        setUploading(false)
      }

      await onCreate({
        ...form,
        organizer: username,
        capacity:  parseInt(form.capacity) || 50,
        imageUrl,
      })

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setForm({ title: "", description: "", date: "", time: "", location: "", capacity: "50", domain: "", clubId: "" })
        setImageFile(null)
        setImagePreview(null)
        onClose()
      }, 1500)
    } catch {
      setError("Failed to create event. Try again.")
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-white/15 shadow-2xl overflow-hidden"
           style={{ background: "rgba(10,6,30,0.98)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles size={16} className="text-purple-300" />
            </div>
            <div>
              <h2 className="font-bold text-white">Create New Event</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
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
            <p className="text-white font-bold text-xl">Event Created!</p>
            <p className="text-gray-400 text-sm">Your event is now visible to all students.</p>
          </div>
        ) : (
          <>
            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Event Banner</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`relative w-full h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden
                    ${dragOver ? "border-purple-400 bg-purple-500/10" : "border-white/15 hover:border-purple-500/50 hover:bg-white/5"}`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <p className="text-white text-sm font-medium">Click to change</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm">Drag & drop or <span className="text-purple-400">browse</span></p>
                      <p className="text-gray-600 text-xs">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Event Title <span className="text-red-400">*</span></label>
                <input
                  value={form.title}
                  onChange={e => update("title", e.target.value)}
                  placeholder="e.g., HackIIST 2026"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Description <span className="text-red-400">*</span></label>
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Tell students what this event is about..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={11} /> Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => update("date", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={11} /> Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => update("time", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Location + Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={11} /> Venue <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.location}
                    onChange={e => update("location", e.target.value)}
                    placeholder="e.g., Main Auditorium"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={11} /> Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={e => update("capacity", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Domain */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Domain</label>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => update("domain", d.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        form.domain === d.value ? d.color : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Club selector */}
              {myClubs.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Link to Club</label>
                  <div className="relative">
                    <select
                      value={form.clubId}
                      onChange={e => update("clubId", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition appearance-none"
                    >
                      <option value="" className="bg-slate-900">No club (general event)</option>
                      {myClubs.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

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
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                  : submitting ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                  : "🚀 Publish Event"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
