import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/clubs/[id]/members — join a club
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { username, role = "member" } = await request.json()
    const { id } = await params

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 })
    }

    const club = await prisma.club.findUnique({
      where: { id }
    })
    
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 })
    }

    const existing = await prisma.clubMember.findUnique({
      where: { clubId_username: { clubId: id, username } }
    })

    if (!existing) {
      await prisma.clubMember.create({
        data: {
          clubId: id,
          username,
          role
        }
      })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/clubs/[id]/members failed:", error)
    return NextResponse.json({ error: "Failed to join club" }, { status: 500 })
  }
}

// DELETE /api/clubs/[id]/members — leave a club
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { username } = await request.json()
    const { id } = await params

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 })
    }

    await prisma.clubMember.deleteMany({
      where: {
        clubId: id,
        username
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/clubs/[id]/members failed:", error)
    return NextResponse.json({ error: "Failed to leave club" }, { status: 500 })
  }
}
