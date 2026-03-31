import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth-utils"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params
    const session = await getSession()
    if (!session || session.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, rejectionReason } = await request.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const club = await prisma.club.update({
      where: { id: clubId },
      data: { status, rejectionReason },
      include: { members: true }
    })

    // If approved, create a post to announce the new club and promote creator
    if (status === "approved") {
      // 1. Create announcement post
      await prisma.post.create({
        data: {
          author: "System",
          content: `🎉 A new club has just been formed: **${club.name}**! 🏢\n\n${club.description}\n\nCheck it out and join now!`,
          imageUrl: club.logoUrl || null,
        }
      })

      // 2. Promote creator to 'leader' globally if they are not already faculty
      const creator = await prisma.member.findUnique({
        where: { username: club.createdBy }
      })

      if (creator && creator.role !== "faculty") {
        await prisma.member.update({
          where: { username: club.createdBy },
          data: { role: "leader" }
        })
      }
    }

    return NextResponse.json(club)
  } catch (error) {
    console.error("PATCH /api/clubs/[id]/status failed:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
