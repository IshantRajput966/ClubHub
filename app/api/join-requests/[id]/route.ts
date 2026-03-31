import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { getSession } from "@/lib/auth-utils"

async function sendStatusEmail(
  to: string,
  username: string,
  clubName: string,
  status: "approved" | "rejected",
  type: string
) {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass || !to) return

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    })

    const isJoin = type === "join"
    const isApproved = status === "approved"

    await transporter.sendMail({
      from:    `"ClubHub IIST" <${user}>`,
      to,
      subject: isApproved
        ? (isJoin ? `🎉 You've been approved to join ${clubName}!` : `👋 Departure request for ${clubName} approved`)
        : (isJoin ? `Your request to join ${clubName} was not approved` : `Departure request for ${clubName} not approved`),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0520;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,${isApproved ? "#059669,#10b981" : "#dc2626,#ef4444"});padding:24px;">
            <h1 style="margin:0;font-size:22px;">${isApproved ? (isJoin ? "🎉 Welcome aboard!" : "👋 Membership Terminated") : "Request Update"}</h1>
          </div>
          <div style="padding:24px;">
            <p style="color:#d1d5db;">Hi <strong style="color:#a78bfa">${username}</strong>,</p>
            ${isApproved
              ? (isJoin 
                  ? `<p style="color:#d1d5db;">Your request to join <strong style="color:#10b981">${clubName}</strong> has been <strong style="color:#10b981">approved</strong>! You are now an official member.</p>`
                  : `<p style="color:#d1d5db;">Your request to leave <strong style="color:#10b981">${clubName}</strong> has been <strong style="color:#10b981">approved</strong>. Your neural affiliation has been successfully terminated.</p>`)
              : (isJoin
                  ? `<p style="color:#d1d5db;">Unfortunately your request to join <strong style="color:#f87171">${clubName}</strong> was not approved at this time.</p>`
                  : `<p style="color:#d1d5db;">Your request to leave <strong style="color:#f87171">${clubName}</strong> has been <strong style="color:#f87171">deferred</strong>. Please reach out to the leadership team for more information.</p>`)
            }
            <a href="http://localhost:3000/clubs"
               style="display:inline-block;margin-top:16px;background:${isApproved ? "#059669" : "#7c3aed"};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
              ${isJoin ? (isApproved ? "View My Clubs" : "Explore Clubs") : "Explore Clubs"}
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id }     = await params
    const { status } = await request.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const requestRow = await prisma.joinRequest.findUnique({
      where: { id },
      include: {
        club: { select: { name: true } }
      }
    })

    if (!requestRow) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Authorization: Must be faculty or a leader of this specific club
    const isFaculty = session.role === "faculty"
    const callerMembership = await prisma.clubMember.findUnique({
      where: { clubId_username: { clubId: requestRow.clubId, username: session.username } }
    })
    const isClubLeader = callerMembership?.role === "president" || callerMembership?.role === "officer"

    if (!isFaculty && !isClubLeader) {
      return NextResponse.json({ error: "Forbidden: You are not a leader of this club" }, { status: 403 })
    }

    // Update status
    await prisma.joinRequest.update({
      where: { id },
      data: { status }
    })

    // If approved — add to ClubMember (join) or remove (leave)
    if (status === "approved") {
      if (requestRow.type === "leave") {
        await prisma.clubMember.delete({
          where: { clubId_username: { clubId: requestRow.clubId, username: requestRow.username } }
        })
      } else {
        const already = await prisma.clubMember.findUnique({
          where: { clubId_username: { clubId: requestRow.clubId, username: requestRow.username } }
        })

        if (!already) {
          await prisma.clubMember.create({
            data: {
              clubId: requestRow.clubId,
              username: requestRow.username,
              role: 'member'
            }
          })
        }

        // Update global Member role to 'member' if they are currently still 'student'
        const user = await prisma.member.findUnique({
          where: { username: requestRow.username }
        })

        if (user && user.role === "student") {
          await prisma.member.update({
            where: { username: requestRow.username },
            data: { role: "member" }
          })
        }
      }
    }

    // Get student email
    const member = await prisma.member.findUnique({
      where: { username: requestRow.username },
      select: { email: true }
    })

    // Send email async
    if (member?.email) {
      sendStatusEmail(member.email, requestRow.username, requestRow.club.name, status, requestRow.type)
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
    await prisma.joinRequest.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
