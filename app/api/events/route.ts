// app/api/events/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth-utils"

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: { attendees: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(events)
  } catch (error) {
    console.error("GET /api/events failed:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "leader" && session.role !== "faculty") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    const { title, description, date, time, location, organizer, capacity, imageUrl, clubId } =
      await request.json()

    // Authorization: If leader, must have permission for clubId
    if (session.role === "leader" && clubId) {
      const membership = await prisma.clubMember.findUnique({
        where: { clubId_username: { clubId, username: session.username } }
      })
      if (!membership || !["president", "officer"].includes(membership.role)) {
        return NextResponse.json({ error: "Forbidden: You are not a leader of this club" }, { status: 403 })
      }
    }

    if (!title || !description || !date || !time || !location || !organizer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date,
        time,
        location,
        organizer,
        capacity: capacity || 50,
        imageUrl: imageUrl || null,
      },
    })

    // Link to club if provided
    if (clubId) {
      await prisma.clubEvent.create({
        data: { clubId, eventId: event.id },
      })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("POST /api/events failed:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
