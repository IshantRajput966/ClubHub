// app/api/join-requests/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"
import { notify } from "@/lib/notification-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const clubId   = searchParams.get("clubId")

    const db = new Database("./dev.db")
    let rows: any[] = []

    if (username) {
      rows = db.prepare(`
        SELECT jr.*, c.name AS clubName, c.domain AS clubDomain, c.logoUrl AS clubLogoUrl
        FROM JoinRequest jr
        JOIN Club c ON jr.clubId = c.id
        WHERE jr.username = ?
        ORDER BY jr.createdAt DESC
      `).all(username)
    } else if (clubId) {
      rows = db.prepare(`
        SELECT jr.*, c.name AS clubName, c.domain AS clubDomain
        FROM JoinRequest jr
        JOIN Club c ON jr.clubId = c.id
        WHERE jr.clubId = ?
        ORDER BY jr.createdAt DESC
      `).all(clubId)
    } else {
      db.close()
      return NextResponse.json({ error: "Provide username or clubId" }, { status: 400 })
    }

    db.close()
    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/join-requests failed:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { clubId, username, message } = await request.json()

    if (!clubId || !username) {
      return NextResponse.json({ error: "clubId and username are required" }, { status: 400 })
    }

    const db = new Database("./dev.db")

    const club = db.prepare("SELECT id, name FROM Club WHERE id = ?").get(clubId) as any
    if (!club) {
      db.close()
      return NextResponse.json({ error: "Club not found" }, { status: 404 })
    }

    const alreadyMember = db.prepare(
      "SELECT id FROM ClubMember WHERE clubId = ? AND username = ?"
    ).get(clubId, username)
    if (alreadyMember) {
      db.close()
      return NextResponse.json({ error: "Already a member" }, { status: 409 })
    }

    const existing = db.prepare(
      "SELECT id, status FROM JoinRequest WHERE clubId = ? AND username = ?"
    ).get(clubId, username) as any

    if (existing) {
      if (existing.status === "pending") {
        db.close()
        return NextResponse.json({ error: "Request already pending" }, { status: 409 })
      }
      db.prepare(`
        UPDATE JoinRequest
        SET status = 'pending', message = ?, updatedAt = datetime('now')
        WHERE id = ?
      `).run(message ?? null, existing.id)
    } else {
      db.prepare(`
        INSERT INTO JoinRequest (id, clubId, username, message, status, createdAt, updatedAt)
        VALUES (lower(hex(randomblob(16))), ?, ?, ?, 'pending', datetime('now'), datetime('now'))
      `).run(clubId, username, message ?? null)
    }

    // 🔔 Notify all leaders/officers of this club
    const leaders = db.prepare(`
      SELECT username FROM ClubMember
      WHERE clubId = ? AND role IN ('president', 'officer')
    `).all(clubId) as { username: string }[]

    db.close()

    leaders.forEach(leader => {
      notify(leader.username, {
        type:      "new_request",
        clubName:  club.name,
        clubId:    club.id,
        username:  username,
        timestamp: Date.now(),
      })
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/join-requests failed:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
