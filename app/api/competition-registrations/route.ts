// app/api/competition-registrations/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"

function ensureTables(db: any) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS CompetitionRegistration (
      id              TEXT PRIMARY KEY,
      competitionId   TEXT NOT NULL,
      competitionName TEXT NOT NULL,
      clubId          TEXT,
      clubName        TEXT,
      name            TEXT NOT NULL,
      email           TEXT NOT NULL,
      phone           TEXT,
      teamName        TEXT,
      status          TEXT DEFAULT 'pending',
      createdAt       TEXT DEFAULT (datetime('now'))
    )
  `).run()

  // Leader notifications table — polled by leader dashboard
  db.prepare(`
    CREATE TABLE IF NOT EXISTS LeaderNotification (
      id          TEXT PRIMARY KEY,
      forUsername TEXT NOT NULL,
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      body        TEXT NOT NULL,
      read        INTEGER DEFAULT 0,
      createdAt   TEXT DEFAULT (datetime('now'))
    )
  `).run()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId   = searchParams.get("clubId")
    const compId   = searchParams.get("competitionId")
    const db       = new Database("./dev.db")
    ensureTables(db)

    let rows: any[]
    if (clubId) {
      rows = db.prepare(
        "SELECT * FROM CompetitionRegistration WHERE clubId = ? ORDER BY createdAt DESC"
      ).all(clubId)
    } else if (compId) {
      rows = db.prepare(
        "SELECT * FROM CompetitionRegistration WHERE competitionId = ? ORDER BY createdAt DESC"
      ).all(compId)
    } else {
      rows = db.prepare(
        "SELECT * FROM CompetitionRegistration ORDER BY createdAt DESC"
      ).all()
    }

    db.close()
    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET competition-registrations failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { competitionId, competitionName, clubId, clubName, name, email, phone, teamName } =
      await request.json()

    if (!name || !email || !competitionId) {
      return NextResponse.json({ error: "name, email, competitionId required" }, { status: 400 })
    }

    const db = new Database("./dev.db")
    ensureTables(db)

    // Prevent duplicate registration
    const existing = db.prepare(
      "SELECT id FROM CompetitionRegistration WHERE competitionId = ? AND email = ?"
    ).get(competitionId, email)

    if (existing) {
      db.close()
      return NextResponse.json({ error: "Already registered with this email" }, { status: 409 })
    }

    // Save registration
    db.prepare(`
      INSERT INTO CompetitionRegistration
        (id, competitionId, competitionName, clubId, clubName, name, email, phone, teamName)
      VALUES
        (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      competitionId, competitionName,
      clubId ?? null, clubName ?? null,
      name, email,
      phone ?? null, teamName ?? null
    )

    // Notify all leaders/officers of the club via LeaderNotification table
    if (clubId) {
      const leaders = db.prepare(`
        SELECT username FROM ClubMember
        WHERE clubId = ? AND role IN ('president', 'officer')
      `).all(clubId) as { username: string }[]

      const teamInfo = teamName ? ` (Team: ${teamName})` : ""
      leaders.forEach(leader => {
        db.prepare(`
          INSERT INTO LeaderNotification (id, forUsername, type, title, body)
          VALUES (lower(hex(randomblob(16))), ?, 'competition_registration', ?, ?)
        `).run(
          leader.username,
          `New Registration: ${competitionName}`,
          `${name}${teamInfo} registered for ${competitionName}. Email: ${email}${phone ? `, Phone: ${phone}` : ""}`
        )
      })
    }

    db.close()
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST competition-registrations failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
