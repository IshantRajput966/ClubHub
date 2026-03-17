"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import AIAgentPanel from "./ai-agent-panel"

// ── Page-specific teaser messages shown in the cloud bubble ──────────────────

const pageTeasers: Record<string, string> = {
  "/dashboard":     "✨ What's on your mind today?",
  "/clubs":         "🏆 Find your perfect club!",
  "/events":        "📅 Got questions about events?",
  "/member":        "👥 Need help managing members?",
  "/announcements": "📢 Want to craft an announcement?",
  "/finances":      "💰 Let me help with finances!",
  "/profile":       "🙋 Need help with your profile?",
  "/join-requests": "📬 Questions about requests?",
  "/explore":       "🔍 Let me help you explore!",
  "/reports":       "📊 Need insights on reports?",
}

function getTeaser(path: string): string {
  if (path.startsWith("/clubs/")) return "🎯 Want insights about this club?"
  return pageTeasers[path] ?? "💬 Need help? Ask me anything!"
}

// ── Cloud SVG shape ───────────────────────────────────────────────────────────

function CloudBubble({ message, onClick }: { message: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-end gap-1.5 focus:outline-none"
      aria-label="Open AI assistant"
    >
      {/* Speech bubble */}
      <div className="relative max-w-[200px] animate-float">
        {/* Bubble body */}
        <div className="relative bg-gradient-to-br from-purple-600/90 to-violet-700/90 backdrop-blur-md border border-purple-400/40 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-xl shadow-purple-900/40 group-hover:from-purple-500/90 group-hover:to-violet-600/90 transition-all duration-300">
          <p className="text-white text-xs font-medium leading-snug whitespace-nowrap">
            {message}
          </p>
          {/* Shine */}
          <div className="absolute inset-0 rounded-2xl rounded-br-sm bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        </div>
        {/* Tail pointing down-right toward the bot icon */}
        <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-violet-700/90 rotate-45 border-r border-b border-purple-400/40" />
      </div>

      {/* Bot orb */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 shadow-lg shadow-purple-900/50 flex items-center justify-center border border-purple-400/40 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-purple-500/40 group-hover:shadow-xl">
        {/* Animated rings */}
        <span className="absolute w-12 h-12 rounded-full border border-purple-400/30 animate-ping-slow" />
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      </div>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PersistentAIAgent() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [teaser, setTeaser] = useState("")
  const [showTeaser, setShowTeaser] = useState(false)

  // Hide on home / login pages
  const hidden = pathname === "/" || pathname.startsWith("/login")

  // Update teaser message on page change, briefly animate it in
  useEffect(() => {
    if (hidden || isOpen) return
    setShowTeaser(false)
    const t1 = setTimeout(() => {
      setTeaser(getTeaser(pathname))
      setShowTeaser(true)
    }, 400)
    // Auto-hide teaser after 6 seconds
    const t2 = setTimeout(() => setShowTeaser(false), 6400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pathname, hidden, isOpen])

  const handleClose = () => setIsOpen(false)

  if (hidden) return null

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(8px); }
        }
        .animate-float       { animation: float 3s ease-in-out infinite; }
        .animate-ping-slow   { animation: ping-slow 2s ease-out infinite; }
        .teaser-enter        { animation: slide-up 0.35s ease forwards; }
        .teaser-exit         { animation: slide-down 0.35s ease forwards; }
      `}</style>

      {/* ── Floating cloud trigger (visible when panel closed) ── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-0">
          {/* Teaser bubble — only shown briefly on page change */}
          {showTeaser && (
            <div className="mb-1 teaser-enter">
              <CloudBubble message={teaser} onClick={() => setIsOpen(true)} />
            </div>
          )}

          {/* Always-visible orb when teaser hidden */}
          {!showTeaser && (
            <button
              onClick={() => setIsOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 shadow-lg shadow-purple-900/50 flex items-center justify-center border border-purple-400/40 hover:scale-110 transition-transform duration-300 hover:shadow-purple-500/40 hover:shadow-xl relative"
              aria-label="Open AI assistant"
            >
              <span className="absolute w-12 h-12 rounded-full border border-purple-400/30 animate-ping-slow" />
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── Full AI panel (slides up when open) ── */}
      {isOpen && (
        <>
          <div
            className="fixed bottom-6 right-6 w-80 h-[520px] z-50 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/50 border border-purple-500/25"
            style={{ animation: "slide-up 0.3s ease forwards" }}
          >
            <AIAgentPanel
              isMinimized={false}
              onClose={handleClose}
            />
          </div>

          {/* Mobile overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={handleClose}
          />
        </>
      )}
    </>
  )
}
