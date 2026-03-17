import { NextResponse } from "next/server"
import Database from "better-sqlite3"

// POST /api/clubs/[id]/members — join a club
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { username, role = "member" } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 })
    }

    const db = new Database("./dev.db")

    // Check club exists
    const club = db.prepare("SELECT id FROM Club WHERE id = ?").get(params.id)
    if (!club) {
      db.close()
      return NextResponse.json({ error: "Club not found" }, { status: 404 })
    }

    // Insert or ignore if already a member
    db.prepare(`
      INSERT OR IGNORE INTO ClubMember (id, clubId, username, role, joinedAt)
      VALUES (lower(hex(randomblob(16))), ?, ?, ?, datetime('now'))
    `).run(params.id, username, role)

    db.close()
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/clubs/[id]/members failed:", error)
    return NextResponse.json({ error: "Failed to join club" }, { status: 500 })
  }
}

// DELETE /api/clubs/[id]/members — leave a club
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 })
    }

    const db = new Database("./dev.db")

    db.prepare(`
      DELETE FROM ClubMember WHERE clubId = ? AND username = ?
    `).run(params.id, username)

    db.close()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/clubs/[id]/members failed:", error)
    return NextResponse.json({ error: "Failed to leave club" }, { status: 500 })
  }
}
