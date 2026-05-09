import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, status } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    // Toggle RSVP: If already exists, delete it (unless status is different)
    const existing = await prisma.eventAttendee.findUnique({
      where: {
        eventId_username: {
          eventId,
          username: session.username,
        },
      },
    })

    if (existing) {
      if (existing.status === status) {
        // Remove RSVP
        await prisma.eventAttendee.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ message: "Successfully removed RSVP", status: null })
      } else {
        // Update status
        const updated = await prisma.eventAttendee.update({
          where: { id: existing.id },
          data: { status },
        })
        return NextResponse.json({ message: "Updated RSVP status", status: updated.status })
      }
    }

    // Check capacity before creating new RSVP
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { attendees: true } } },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event._count.attendees >= event.capacity) {
      return NextResponse.json({ error: "Event capacity reached" }, { status: 400 })
    }

    const newRsvp = await prisma.eventAttendee.create({
      data: {
        eventId,
        username: session.username,
        status: status || "going",
      },
    })

    return NextResponse.json({ message: "RSVP confirmed", status: newRsvp.status }, { status: 201 })
  } catch (error) {
    console.error("POST /api/events/rsvp failed:", error)
    return NextResponse.json({ error: "Failed to process RSVP" }, { status: 500 })
  }
}
