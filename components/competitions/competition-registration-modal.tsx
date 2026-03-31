"use client"

import { useState } from "react"
import { X, Trophy, Loader2, CheckCircle } from "lucide-react"

interface Competition {
  id: string
  title: string
  deadline: string
  description: string
  clubId: string   // which club owns this competition
  clubName: string
}

interface Props {
  competition: Competition
  onClose: () => void
}

export function CompetitionRegistrationModal({ competition, onClose }: Props) {
  const [form, setForm] = useState({
    name:     sessionStorage.getItem("username") ?? "",
    email:    "",
    phone:    "",
    teamName: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email) {
      setError("Name and email are required.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/competition-registrations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId:   competition.id,
          competitionName: competition.title,
          clubId:          competition.clubId,
          clubName:        competition.clubName,
          name:     form.name,
          email:    form.email,
          phone:    form.phone,
          teamName: form.teamName,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      setSuccess(true)
    } catch {
      setError("Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden"
           style={{ background: "rgba(15,10,40,0.97)" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Trophy size={16} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">{competition.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Register before {competition.deadline}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">Registration Submitted!</p>
              <p className="text-gray-400 text-sm mt-1">
                The club leader will review your registration and get back to you.
              </p>
            </div>
            <button onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition">
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <div className="p-6 flex flex-col gap-4">
            <p className="text-gray-400 text-sm">{competition.description}</p>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input
                value={form.name}
                onChange={e => update("name", e.target.value)}
                placeholder="Your full name"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Phone + Team Name side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => update("phone", e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Team Name</label>
                <input
                  value={form.teamName}
                  onChange={e => update("teamName", e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-medium transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Register"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
