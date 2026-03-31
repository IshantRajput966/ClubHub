// app/api/leader-notifications/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    if (!username) return NextResponse.json([], { status: 200 })

    const rows = await prisma.leaderNotification.findMany({
      where: { forUsername: username, read: 0 },
      orderBy: { createdAt: 'desc' }
    })

    // Mark as read
    if (rows.length > 0) {
      await prisma.leaderNotification.updateMany({
        where: { forUsername: username, read: 0 },
        data: { read: 1 }
      })
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET leader-notifications failed:", error)
    return NextResponse.json([], { status: 200 })
  }
}
