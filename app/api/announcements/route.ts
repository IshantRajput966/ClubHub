import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { getSession } from "@/lib/auth-utils"

async function sendEmailNotifications(
  members: { email: string; username: string }[],
  announcement: { title: string; content: string; author: string; clubName?: string | null }
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
    const rows = await prisma.announcement.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/announcements failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, imageUrl, expiresAt, clubId, pinned } = await request.json()
    const author = session.username // Force secure author

    // Authorization: If leader, must have permission for clubId
    if (session.role === "leader") {
      if (!clubId) {
        return NextResponse.json({ error: "Leaders must specify a clubId" }, { status: 400 })
      }
      const membership = await prisma.clubMember.findUnique({
        where: { clubId_username: { clubId, username: session.username } }
      })
      if (!membership || !["president", "officer"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden: You are not a leader of this club" }, { status: 403 })
      }
    }

    if (!title || !content) {
      return NextResponse.json({ error: "title and content required" }, { status: 400 })
    }

    // Get club name if clubId provided
    let clubName: string | null = null
    if (clubId) {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: { name: true }
      })
      clubName = club?.name ?? null
    }

    const ann = await prisma.announcement.create({
      data: {
        title,
        content,
        author,
        imageUrl: imageUrl ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        clubId: clubId ?? null,
        clubName,
        pinned: pinned ? 1 : 0,
      }
    })

    // Get members to email
    let members: { email: string; username: string }[] = []
    
    if (clubId) {
      // Club-specific — email all club members
      const clubMemberships = await prisma.clubMember.findMany({
        where: { clubId },
        select: { username: true }
      })
      const usernames = clubMemberships.map(cm => cm.username)
      members = await prisma.member.findMany({
        where: {
          username: { in: usernames },
          email: { not: "" }
        },
        select: { email: true, username: true }
      })
    } else {
      // Global — email all members except generic 'student' role (who maybe haven't signed up properly or just basic access)
      members = await prisma.member.findMany({
        where: {
          email: { not: "" },
          role: { not: "student" }
        },
        select: { email: true, username: true }
      })
    }

    // Send emails async (don't await — don't block response)
    sendEmailNotifications(members, { title, content, author, clubName })

    return NextResponse.json(ann, { status: 201 })
  } catch (error) {
    console.error("POST /api/announcements failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
