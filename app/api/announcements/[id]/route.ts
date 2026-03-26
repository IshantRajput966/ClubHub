// app/api/announcements/[id]/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }     = await params
    const { pinned } = await request.json()
    const db         = new Database("./dev.db")
    db.prepare("UPDATE Announcement SET pinned = ? WHERE id = ?").run(pinned ? 1 : 0, id)
    db.close()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db     = new Database("./dev.db")
    db.prepare("DELETE FROM Announcement WHERE id = ?").run(id)
    db.close()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
