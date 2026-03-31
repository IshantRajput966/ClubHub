import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const club = await prisma.club.findUnique({
      where: { id: id },
      include: {
        members: {
          select: {
            username: true,
            role: true,
            joinedAt: true,
          },
        },
        events: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                description: true,
                date: true,
                time: true,
                location: true,
                capacity: true,
                attendees: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(club)
  } catch (error) {
    console.error("GET /api/clubs/[id] failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch club" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { description, logoUrl, bannerUrl } = await request.json()

    const club = await prisma.club.update({
      where: { id: id },
      data: {
        description: description || undefined,
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
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

    return NextResponse.json(club)
  } catch (error) {
    console.error("PATCH /api/clubs/[id] failed:", error)
    return NextResponse.json(
      { error: "Failed to update club" },
      { status: 500 }
    )
  }
}
