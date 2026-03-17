// app/api/announcements/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"
import nodemailer from "nodemailer"

function ensureColumns(db: any) {
  // Add missing columns if they don't exist
  const cols = db.prepare("PRAGMA table_info(Announcement)").all().map((c: any) => c.name)
  if (!cols.includes("clubId"))  db.prepare("ALTER TABLE Announcement ADD COLUMN clubId TEXT").run()
  if (!cols.includes("pinned"))  db.prepare("ALTER TABLE Announcement ADD COLUMN pinned INTEGER DEFAULT 0").run()
  if (!cols.includes("clubName")) db.prepare("ALTER TABLE Announcement ADD COLUMN clubName TEXT").run()
}

async function sendEmailNotifications(
  members: { email: string; username: string }[],
  announcement: { title: string; content: string; author: string; clubName?: string }
) {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass) return // Skip if email not configured

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    })

    const emails = members.map(m => m.email).filter(Boolean)
    if (emails.length === 0) return

    await transporter.sendMail({
      from:    `"ClubHub IIST" <${user}>`,
      bcc:     emails.join(","),
      subject: `📢 ${announcement.clubName ? `[${announcement.clubName}] ` : ""}${announcement.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0520;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:24px;">
            <h1 style="margin:0;font-size:22px;">📢 New Announcement</h1>
            ${announcement.clubName ? `<p style="margin:4px 0 0;opacity:0.8;font-size:14px;">${announcement.clubName}</p>` : ""}
          </div>
          <div style="padding:24px;">
            <h2 style="color:#a78bfa;margin-top:0;">${announcement.title}</h2>
            <p style="color:#d1d5db;line-height:1.6;">${announcement.content}</p>
            <p style="color:#6b7280;font-size:13px;margin-top:24px;">Posted by <strong style="color:#a78bfa">${announcement.author}</strong></p>
            <a href="http://localhost:3000/announcements"
               style="display:inline-block;margin-top:16px;background:#7c3aed;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
              View on ClubHub
            </a>
          </div>
          <div style="padding:16px 24px;background:#060212;color:#6b7280;font-size:12px;">
            IIST Indore — ClubHub Student Platform
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error("Email send failed:", err)
  }
}

export async function GET() {
  try {
    const db = new Database("./dev.db")
    ensureColumns(db)

    const rows = db.prepare(`
      SELECT * FROM Announcement
      WHERE expiresAt IS NULL OR expiresAt > datetime('now')
      ORDER BY pinned DESC, createdAt DESC
    `).all()

    db.close()
    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/announcements failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, author, imageUrl, expiresAt, clubId, pinned } = await request.json()

    if (!title || !content || !author) {
      return NextResponse.json({ error: "title, content, author required" }, { status: 400 })
    }

    const db = new Database("./dev.db")
    ensureColumns(db)

    // Get club name if clubId provided
    let clubName: string | null = null
    if (clubId) {
      const club = db.prepare("SELECT name FROM Club WHERE id = ?").get(clubId) as any
      clubName = club?.name ?? null
    }

    const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2)}`

    db.prepare(`
      INSERT INTO Announcement (id, title, content, author, imageUrl, expiresAt, clubId, clubName, pinned, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, title, content, author, imageUrl ?? null, expiresAt ?? null, clubId ?? null, clubName, pinned ? 1 : 0)

    const ann = db.prepare("SELECT * FROM Announcement WHERE id = ?").get(id)

    // Get members to email
    let members: { email: string; username: string }[] = []
    if (clubId) {
      // Club-specific — email all club members
      const clubMembers = db.prepare(`
        SELECT m.email, m.username FROM Member m
        JOIN ClubMember cm ON cm.username = m.username
        WHERE cm.clubId = ? AND m.email IS NOT NULL AND m.email != ''
      `).all(clubId) as any[]
      members = clubMembers
    } else {
      // Global — email all members
      members = db.prepare(
        "SELECT email, username FROM Member WHERE email IS NOT NULL AND email != '' AND role != 'student'"
      ).all() as any[]
    }

    db.close()

    // Send emails async (don't await — don't block response)
    sendEmailNotifications(members, { title, content, author, clubName: clubName ?? undefined })

    return NextResponse.json(ann, { status: 201 })
  } catch (error) {
    console.error("POST /api/announcements failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
