// app/api/join-requests/[id]/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"
import nodemailer from "nodemailer"

async function sendStatusEmail(
  to: string,
  username: string,
  clubName: string,
  status: "approved" | "rejected"
) {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass || !to) return

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    })

    const isApproved = status === "approved"

    await transporter.sendMail({
      from:    `"ClubHub IIST" <${user}>`,
      to,
      subject: isApproved
        ? `🎉 You've been approved to join ${clubName}!`
        : `Your request to join ${clubName} was not approved`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0520;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,${isApproved ? "#059669,#10b981" : "#dc2626,#ef4444"});padding:24px;">
            <h1 style="margin:0;font-size:22px;">${isApproved ? "🎉 Welcome aboard!" : "Request Update"}</h1>
          </div>
          <div style="padding:24px;">
            <p style="color:#d1d5db;">Hi <strong style="color:#a78bfa">${username}</strong>,</p>
            ${isApproved
              ? `<p style="color:#d1d5db;">Your request to join <strong style="color:#10b981">${clubName}</strong> has been <strong style="color:#10b981">approved</strong>! You are now an official member.</p>
                 <p style="color:#d1d5db;">Log in to ClubHub to see your new club and connect with other members.</p>`
              : `<p style="color:#d1d5db;">Unfortunately your request to join <strong style="color:#f87171">${clubName}</strong> was not approved at this time.</p>
                 <p style="color:#d1d5db;">You can try applying again later or explore other clubs on ClubHub.</p>`
            }
            <a href="http://localhost:3000/clubs"
               style="display:inline-block;margin-top:16px;background:${isApproved ? "#059669" : "#7c3aed"};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
              ${isApproved ? "View My Clubs" : "Explore Clubs"}
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }     = await params
    const { status } = await request.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const db = new Database("./dev.db")

    const row = db.prepare(`
      SELECT jr.*, c.name as clubName
      FROM JoinRequest jr
      JOIN Club c ON c.id = jr.clubId
      WHERE jr.id = ?
    `).get(id) as any

    if (!row) {
      db.close()
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Update status
    db.prepare(`
      UPDATE JoinRequest SET status = ?, updatedAt = datetime('now') WHERE id = ?
    `).run(status, id)

    // If approved — add to ClubMember
    if (status === "approved") {
      const already = db.prepare(
        "SELECT id FROM ClubMember WHERE clubId = ? AND username = ?"
      ).get(row.clubId, row.username)

      if (!already) {
        db.prepare(`
          INSERT INTO ClubMember (id, clubId, username, role, joinedAt)
          VALUES (lower(hex(randomblob(16))), ?, ?, 'member', datetime('now'))
        `).run(row.clubId, row.username)
      }
    }

    // Get student email
    const member = db.prepare(
      "SELECT email FROM Member WHERE username = ?"
    ).get(row.username) as any

    db.close()

    // Send email async
    if (member?.email) {
      sendStatusEmail(member.email, row.username, row.clubName, status)
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("PATCH error:", error)
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
    db.prepare("DELETE FROM JoinRequest WHERE id = ?").run(id)
    db.close()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
