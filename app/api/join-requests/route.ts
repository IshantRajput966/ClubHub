import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notification-store"
import { getSession } from "@/lib/auth-utils"
import twilio from "twilio"

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const clubId   = searchParams.get("clubId")

    let rows: any[] = []

    if (username) {
      const rawRows = await prisma.joinRequest.findMany({
        where: { username },
        include: {
          club: { select: { name: true, domain: true, logoUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      rows = rawRows.map(r => ({
        ...r,
        clubName: r.club.name,
        clubDomain: r.club.domain,
        clubLogoUrl: r.club.logoUrl
      }))
    } else if (clubId) {
      const rawRows = await prisma.joinRequest.findMany({
        where: { clubId },
        include: {
          club: { select: { name: true, domain: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      rows = rawRows.map(r => ({
        ...r,
        clubName: r.club.name,
        clubDomain: r.club.domain
      }))
    } else {
      return NextResponse.json({ error: "Provide username or clubId" }, { status: 400 })
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/join-requests failed:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clubId, message, name, branch, year } = await request.json()
    const username = session.username

    if (!clubId) {
      return NextResponse.json({ error: "clubId is required" }, { status: 400 })
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true }
    })
    
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 })
    }

    const alreadyMember = await prisma.clubMember.findUnique({
      where: { clubId_username: { clubId, username } }
    })
    
    if (alreadyMember) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 })
    }

    const existing = await prisma.joinRequest.findUnique({
      where: { clubId_username: { clubId, username } }
    })

    let joinReq;
    if (existing) {
      if (existing.status === "pending") {
        return NextResponse.json({ error: "Request already pending" }, { status: 409 })
      }
      joinReq = await prisma.joinRequest.update({
        where: { id: existing.id },
        data: { status: 'pending', message: message ?? null, name, branch, year }
      })
    } else {
      joinReq = await prisma.joinRequest.create({
        data: { clubId, username, message: message ?? null, status: 'pending', name, branch, year }
      })
    }

    // 🔔 Notify all leaders/officers of this club
    const leaders = await prisma.clubMember.findMany({
      where: {
        clubId,
        role: { in: ['president', 'officer'] }
      },
      select: { username: true }
    })

    leaders.forEach(leader => {
      notify(leader.username, {
        type:      "new_request",
        clubName:  club.name,
        clubId:    club.id,
        username:  username,
        timestamp: Date.now(),
      })
    })

    // 📱 Fetch the actual Club President's phone number
    let leaderPhone = '+917976800451'; // Fallback to provided number
    try {
      const president = await prisma.clubMember.findFirst({
        where: { clubId, role: 'president' }
      });
      if (president) {
        const presidentDetails = await prisma.member.findUnique({
          where: { username: president.username }
        });
        if (presidentDetails?.phone) {
          leaderPhone = presidentDetails.phone;
        }
      }
    } catch(err) {
      console.error("Failed to fetch president phone", err);
    }

    // 📱 Dispatch Twilio SMS
    try {
      const shortId = joinReq.id.slice(-6).toUpperCase(); // Last 6 chars for brevity
      await twilioClient.messages.create({
        body: `ClubHub Alert: ${name} wants to join ${club.name}.\nID: ${shortId}\nReply 'JOIN_APP ${shortId}' to approve or 'JOIN_REJ ${shortId}' to reject.`,
        from: process.env.TWILIO_PHONE_NUMBER || '+12605255832',
        to: leaderPhone
      })
    } catch (smsError) {
      console.error("Twilio SMS failed to send:", smsError)
      // We don't fail the request if SMS fails, the join request still logs to DB
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/join-requests failed:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
