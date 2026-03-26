"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { EventCard } from "@/components/events/event-card"
import { CreateEventModal } from "@/components/events/create-event-modal"
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  organizer: string
  capacity: number
  attendees: Array<{ id: string; username: string; status: string }>
  imageUrl?: string
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({ events, onSelectDate, selectedDate }: {
  events: Event[]
  onSelectDate: (date: string | null) => void
  selectedDate: string | null
}) {
  const [viewDate, setViewDate] = useState(new Date())

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthName = viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })

  // Days in month
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Event dates set for quick lookup
  const eventDates = new Set(
    events.map(e => {
      const d = new Date(e.date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    })
  )

  function pad(n: number) { return String(n).padStart(2, "0") }

  function cellDate(day: number) {
    return `${year}-${pad(month + 1)}-${pad(day)}`
  }

  function isToday(day: number) {
    const t = new Date()
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day
  }

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)) }

  const blanks = Array(firstDay).fill(null)
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
          <ChevronLeft size={14} />
        </button>
        <p className="text-base font-bold text-white">{monthName}</p>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1.5">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map(day => {
          const dateStr   = cellDate(day)
          const hasEvent  = eventDates.has(dateStr)
          const isSelected = selectedDate === dateStr
          const today     = isToday(day)

          return (
            <button
              key={day}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`relative flex flex-col items-center justify-center aspect-square w-full rounded-lg text-sm font-medium transition
                ${isSelected ? "bg-purple-600 text-white" :
                  today ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" :
                  hasEvent ? "text-white hover:bg-white/10" :
                  "text-gray-500 hover:bg-white/5"}`}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <button
          onClick={() => onSelectDate(null)}
          className="mt-3 w-full text-xs text-gray-400 hover:text-white transition py-1.5 rounded-lg hover:bg-white/5"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}

// ── Upcoming Events Sidebar List ──────────────────────────────────────────────

function UpcomingList({ events, onSelectDate }: { events: Event[], onSelectDate: (d: string) => void }) {
  const now = new Date()
  const upcoming = events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  const monthColors: Record<string, string> = {}
  const palette = ["text-purple-300", "text-pink-300", "text-blue-300", "text-emerald-300", "text-yellow-300", "text-orange-300"]
  let ci = 0

  function colorFor(monthKey: string) {
    if (!monthColors[monthKey]) { monthColors[monthKey] = palette[ci++ % palette.length] }
    return monthColors[monthKey]
  }

  return (
    <div className="rounded-2xl border border-white/10 p-4 mt-4" style={{ background: "rgba(255,255,255,0.05)" }}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming</p>
      {upcoming.length === 0 ? (
        <p className="text-gray-500 text-xs">No upcoming events</p>
      ) : (
        <div className="flex flex-col gap-2">
          {upcoming.map(e => {
            const d        = new Date(e.date)
            const day      = d.getDate()
            const monthKey = `${d.getFullYear()}-${d.getMonth()}`
            const month    = d.toLocaleDateString("en-IN", { month: "short" })
            const color    = colorFor(monthKey)
            const dateStr  = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`

            return (
              <button
                key={e.id}
                onClick={() => onSelectDate(dateStr)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/8 transition text-left group"
              >
                <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 shrink-0`}>
                  <span className={`text-base font-bold leading-none ${color}`}>{day}</span>
                  <span className="text-[9px] text-gray-500 uppercase">{month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium line-clamp-1 group-hover:text-purple-200 transition">{e.title}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1">{e.time} · {e.location}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents]           = useState<Event[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [role, setRole]               = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    setRole(sessionStorage.getItem("role"))
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/events")
      if (!res.ok) throw new Error("Failed")
      setEvents(await res.json())
      setError(null)
    } catch {
      setError("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
      if (!res.ok) throw new Error("Failed")
      const newEvent = await res.json()
      setEvents(prev => [newEvent, ...prev])
      setIsModalOpen(false)
    } catch {
      setError("Failed to create event")
    }
  }

  const canCreate = role === "leader" || role === "faculty"

  // Filter by selected date
  const filteredEvents = selectedDate
    ? events.filter(e => {
        const d = new Date(e.date)
        const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
        return ds === selectedDate
      })
    : events

  const selectedLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden bg-transparent">

        {/* ── Main content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Events</h1>
                  {selectedLabel && (
                    <p className="text-sm text-purple-300 mt-0.5">Showing events on {selectedLabel}</p>
                  )}
                </div>
              </div>
              {canCreate && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition"
                >
                  <Plus className="w-5 h-5" /> Create Event
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">{error}</div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  {selectedDate ? "No events on this date" : "No events yet"}
                </p>
                {selectedDate && (
                  <button onClick={() => setSelectedDate(null)} className="mt-2 text-purple-400 hover:text-purple-300 text-sm transition">
                    Show all events →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} {...event} onRsvp={() => {}} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar: Calendar ── */}
        <div className="w-96 shrink-0 border-l border-white/10 overflow-y-auto p-5"
             style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)" }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={11} /> Calendar
          </p>
          <MiniCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <UpcomingList
            events={events}
            onSelectDate={d => setSelectedDate(d)}
          />
        </div>
      </div>

      {canCreate && (
        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateEvent}
        />
      )}
    </div>
  )
}
