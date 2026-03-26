// app/api/reports/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"

export async function GET() {
  try {
    const db = new Database("./dev.db")

    // ── 1. Club summaries ──────────────────────────────────────────────────
    const clubs = db.prepare(`
      SELECT c.id, c.name, c.domain, c.createdBy,
        COUNT(DISTINCT cm.username) as memberCount
      FROM Club c
      LEFT JOIN ClubMember cm ON cm.clubId = c.id
      GROUP BY c.id
      ORDER BY memberCount DESC
    `).all() as any[]

    // Events per club
    const clubEvents = db.prepare(`
      SELECT ce.clubId, COUNT(*) as eventCount
      FROM ClubEvent ce
      GROUP BY ce.clubId
    `).all() as any[]
    const eventCountMap: Record<string, number> = {}
    clubEvents.forEach((r: any) => { eventCountMap[r.clubId] = r.eventCount })

    const clubSummaries = clubs.map(c => ({
      ...c,
      eventCount: eventCountMap[c.id] ?? 0,
    }))

    // ── 2. Member stats ────────────────────────────────────────────────────
    const memberStats = db.prepare(`
      SELECT role, COUNT(*) as count FROM Member GROUP BY role
    `).all() as any[]

    const totalMembers = db.prepare(`SELECT COUNT(*) as count FROM Member`).get() as any

    // Top members by club count
    const topMembers = db.prepare(`
      SELECT username, COUNT(*) as clubCount
      FROM ClubMember
      GROUP BY username
      ORDER BY clubCount DESC
      LIMIT 10
    `).all() as any[]

    // ── 3. Event stats ─────────────────────────────────────────────────────
    const totalEvents = db.prepare(`SELECT COUNT(*) as count FROM Event`).get() as any

    const upcomingEvents = db.prepare(`
      SELECT COUNT(*) as count FROM Event WHERE date >= date('now')
    `).get() as any

    const eventsByMonth = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
      FROM Event
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `).all() as any[]

    const topEvents = db.prepare(`
      SELECT e.title, e.date, e.location, e.capacity, e.organizer,
        COUNT(ea.id) as attendeeCount
      FROM Event e
      LEFT JOIN EventAttendee ea ON ea.eventId = e.id
      GROUP BY e.id
      ORDER BY attendeeCount DESC
      LIMIT 5
    `).all() as any[]

    // ── 4. Join request trends ─────────────────────────────────────────────
    const joinRequestStats = db.prepare(`
      SELECT status, COUNT(*) as count FROM JoinRequest GROUP BY status
    `).all() as any[]

    const recentRequests = db.prepare(`
      SELECT jr.username, jr.status, jr.createdAt, c.name as clubName
      FROM JoinRequest jr
      JOIN Club c ON c.id = jr.clubId
      ORDER BY jr.createdAt DESC
      LIMIT 10
    `).all() as any[]

    // ── 5. Post activity ───────────────────────────────────────────────────
    const totalPosts = db.prepare(`SELECT COUNT(*) as count FROM Post`).get() as any

    const postsByAuthor = db.prepare(`
      SELECT author, COUNT(*) as count
      FROM Post
      GROUP BY author
      ORDER BY count DESC
      LIMIT 10
    `).all() as any[]

    const recentPosts = db.prepare(`
      SELECT author, substr(content, 1, 80) as preview, createdAt
      FROM Post
      ORDER BY createdAt DESC
      LIMIT 5
    `).all() as any[]

    // ── 6. Domain breakdown ────────────────────────────────────────────────
    const domainBreakdown = db.prepare(`
      SELECT domain, COUNT(*) as count FROM Club GROUP BY domain ORDER BY count DESC
    `).all() as any[]

    db.close()

    return NextResponse.json({
      clubSummaries,
      memberStats,
      totalMembers: totalMembers.count,
      topMembers,
      totalEvents: totalEvents.count,
      upcomingEvents: upcomingEvents.count,
      eventsByMonth,
      topEvents,
      joinRequestStats,
      recentRequests,
      totalPosts: totalPosts.count,
      postsByAuthor,
      recentPosts,
      domainBreakdown,
    })
  } catch (error) {
    console.error("GET /api/reports failed:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
