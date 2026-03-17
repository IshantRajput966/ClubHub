// app/api/leader-notifications/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    if (!username) return NextResponse.json([], { status: 200 })

    const db = new Database("./dev.db")

    // Table may not exist yet
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

    const rows = db.prepare(
      "SELECT * FROM LeaderNotification WHERE forUsername = ? AND read = 0 ORDER BY createdAt DESC"
    ).all(username)

    // Mark as read
    if (rows.length > 0) {
      db.prepare(
        "UPDATE LeaderNotification SET read = 1 WHERE forUsername = ? AND read = 0"
      ).run(username)
    }

    db.close()
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
