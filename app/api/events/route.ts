// app/api/events/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    const { title, description, date, time, location, organizer, capacity, imageUrl, clubId, domain } =
      await request.json()

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
