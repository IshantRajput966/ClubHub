import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth-utils"
import { notify } from "@/lib/notification-store"

/**
 * POST /api/clubs/[id]/leave
 * Creates a "Leave Request" for the current user.
 * This satisfies the requirement that someone can't just leave, 
 * but must request permission from the club leader.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: clubId } = await params
    const username = session.username

    const { reason } = await request.json()

    // 1. Verify existence of membership
    const membership = await prisma.clubMember.findUnique({
      where: { clubId_username: { clubId, username } }
    })

    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this club." }, { status: 400 })
    }

    if (membership.role === "president") {
      return NextResponse.json({ error: "The President cannot leave the club. Transfer leadership first." }, { status: 400 })
    }

    // 2. Create the Leave Request
    // We use upsert to handle cases where a user might re-send the request if it was ignored
    const leaveRequest = await prisma.joinRequest.upsert({
      where: { clubId_username: { clubId, username } },
      update: {
        type: "leave",
        status: "pending",
        message: reason || "Standard Departure Request",
        updatedAt: new Date()
      },
      create: {
        clubId,
        username,
        type: "leave",
        status: "pending",
        message: reason || "Standard Departure Request"
      },
      include: { club: { select: { name: true } } }
    })

    // 3. Notify the leaders
    const leaders = await prisma.clubMember.findMany({
      where: {
        clubId,
        role: { in: ['president', 'officer'] }
      },
      select: { username: true }
    })

    leaders.forEach(leader => {
      notify(leader.username, {
        type:      "new_leave_request",
        clubName:  leaveRequest.club.name,
        clubId:    clubId,
        username:  username,
        timestamp: Date.now(),
      })
    })

    return NextResponse.json({ 
      success: true, 
      message: "Departure request transmitted to club leadership. Awaiting authorization." 
    })
  } catch (error) {
    console.error("POST /api/clubs/[id]/leave failed:", error)
    return NextResponse.json(
      { error: "Neural link disconnection request failed. Please try again." },
      { status: 500 }
    )
  }
}
