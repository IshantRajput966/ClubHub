// app/api/reports/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // ── 1. Club summaries ──────────────────────────────────────────────────
    const clubsQuery = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        createdBy: true,
        _count: { select: { members: true, events: true } }
      },
    })
    
    // Sort manually by members count in memory since Prisma orderBy for _count relation requires Prisma 5+ features 
    // and we already pulled it into memory. Sorting 50-100 clubs is instantaneous.
    const clubSummaries = clubsQuery
      .map(c => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
        createdBy: c.createdBy,
        memberCount: c._count.members,
        eventCount: c._count.events,
      }))
      .sort((a, b) => b.memberCount - a.memberCount)

    // ── 2. Member stats ────────────────────────────────────────────────────
    const memberStatsQuery = await prisma.member.groupBy({
      by: ['role'],
      _count: { role: true }
    })
    const memberStats = memberStatsQuery.map(r => ({ role: r.role, count: r._count.role }))

    const totalMembers = await prisma.member.count()

    const topMembersQuery = await prisma.clubMember.groupBy({
      by: ['username'],
      _count: { clubId: true },
      orderBy: { _count: { clubId: 'desc' } },
      take: 10
    })
    const topMembers = topMembersQuery.map(r => ({ username: r.username, clubCount: r._count.clubId }))

    // ── 3. Event stats ─────────────────────────────────────────────────────
    const totalEvents = await prisma.event.count()

    const todayDateStr = new Date().toISOString().split('T')[0]
    const upcomingEvents = await prisma.event.count({
      where: { date: { gte: todayDateStr } }
    })

    // Raw query needed for specific strftime formatting on sqlite string columns
    const eventsByMonthRaw: any[] = await prisma.$queryRaw`
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
      FROM Event
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `
    const eventsByMonth = eventsByMonthRaw.map(e => ({ month: e.month, count: Number(e.count) }))

    const topEventsQuery = await prisma.event.findMany({
      select: {
        title: true,
        date: true,
        location: true,
        capacity: true,
        organizer: true,
        _count: { select: { attendees: true } }
      },
      // Note: If you face relation ordering limit in older Prisma, we can sort JS, but this usually works.
      orderBy: { attendees: { _count: 'desc' } },
      take: 5
    })
    const topEvents = topEventsQuery.map(e => ({
      title: e.title,
      date: e.date,
      location: e.location,
      capacity: e.capacity,
      organizer: e.organizer,
      attendeeCount: e._count.attendees
    }))

    // ── 4. Join request trends ─────────────────────────────────────────────
    const joinRequestStatsQuery = await prisma.joinRequest.groupBy({
      by: ['status'],
      _count: { status: true }
    })
    const joinRequestStats = joinRequestStatsQuery.map(r => ({ status: r.status, count: r._count.status }))

    const recentRequestsQuery = await prisma.joinRequest.findMany({
      select: {
        username: true,
        status: true,
        createdAt: true,
        club: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    const recentRequests = recentRequestsQuery.map(r => ({
      username: r.username,
      status: r.status,
      createdAt: r.createdAt,
      clubName: r.club.name
    }))

    // ── 5. Post activity ───────────────────────────────────────────────────
    const totalPosts = await prisma.post.count()

    const postsByAuthorQuery = await prisma.post.groupBy({
      by: ['author'],
      _count: { author: true },
      orderBy: { _count: { author: 'desc' } },
      take: 10
    })
    const postsByAuthor = postsByAuthorQuery.map(p => ({ author: p.author, count: p._count.author }))

    const recentPostsQuery = await prisma.post.findMany({
      select: { author: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    const recentPosts = recentPostsQuery.map(p => ({
      author: p.author,
      preview: p.content.slice(0, 80),
      createdAt: p.createdAt
    }))

    // ── 6. Domain breakdown ────────────────────────────────────────────────
    const domainBreakdownQuery = await prisma.club.groupBy({
      by: ['domain'],
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } }
    })
    const domainBreakdown = domainBreakdownQuery.map(d => ({ domain: d.domain, count: d._count.domain }))

    return NextResponse.json({
      clubSummaries,
      memberStats,
      totalMembers,
      topMembers,
      totalEvents,
      upcomingEvents,
      eventsByMonth,
      topEvents,
      joinRequestStats,
      recentRequests,
      totalPosts,
      postsByAuthor,
      recentPosts,
      domainBreakdown,
    })
  } catch (error) {
    console.error("GET /api/reports failed:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
