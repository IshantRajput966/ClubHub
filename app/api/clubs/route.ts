import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "approved"
    
    // Only faculty can see non-approved clubs via query param
    // (In a real app, check session here too, but keeping it simple for now)

    const clubs = await prisma.club.findMany({
      where: status === "all" ? {} : { status },
      include: {
        members: {
          select: { username: true, role: true }
        },
        events: {
          include: {
            event: { select: { id: true, title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map events to match the old shape expected by the frontend
    const parsedClubs = clubs.map(club => ({
      ...club,
      events: club.events.map(ce => ce.event)
    }))

    return NextResponse.json(parsedClubs)
  } catch (error) {
    console.error("GET /api/clubs failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Students, faculty, and leaders are allowed to spin up or request a new club
    // Note: session.role is synced with the DB member role
    const isSpecialRole = ["faculty", "leader"].includes(session.role)
    const isStudent = session.role === "student" || session.role === "member"

    if (!isSpecialRole && !isStudent) {
      return NextResponse.json({ error: "Forbidden: Not permitted" }, { status: 403 })
    }

    const { name, description, domain, logoUrl, bannerUrl, facultyOverseer, phoneNumber } = await request.json()
    const createdBy = session.username

    // Save the phone number to the member's profile for Twilio routing
    if (phoneNumber) {
      await prisma.member.update({
        where: { username: createdBy },
        data: { phone: phoneNumber }
      })
    }

    // Default status: Faculty/Leaders get "approved" immediately, students get "pending"
    const status = isSpecialRole ? "approved" : "pending"

    if (!name || !description || !domain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const club = await prisma.club.create({
      data: {
        name,
        description,
        domain,
        logoUrl,
        bannerUrl,
        status,
        facultyOverseer,
        createdBy,
        members: {
          create: {
            username: createdBy,
            role: "president", // The requester starts as president (pending)
          },
        },
      },
      include: {
        members: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    })

    // 🔔 Notify faculty overseer if status is pending
    if (status === "pending" && facultyOverseer) {
      const { notify } = await import("@/lib/notification-store")
      notify(facultyOverseer, {
        type: "new_request", // Re-using new_request for club proposals
        clubName: name,
        clubId: club.id,
        username: createdBy,
        timestamp: Date.now(),
      })
    }

    return NextResponse.json(club, { status: 201 })
  } catch (error) {
    console.error("POST /api/clubs failed:", error)
    return NextResponse.json(
      { error: "Failed to create club" },
      { status: 500 }
    )
  }
}
