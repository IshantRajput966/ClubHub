import { NextResponse } from "next/server"
import Database from "better-sqlite3"

export async function GET(request: Request) {
  try {
    const db = new Database("./dev.db")

    // For now, hardcode the username. In a real app, this would come from auth
    const username = "lakshya_dev"

    const userClubs = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.domain,
        c.logoUrl,
        c.bannerUrl
      FROM Club c
      JOIN ClubMember cm ON c.id = cm.clubId
      WHERE cm.username = ?
    `).all(username)

    db.close()
    return NextResponse.json(userClubs)
  } catch (error) {
    console.error("GET /api/user/clubs failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch user clubs" },
      { status: 500 }
    )
  }
}