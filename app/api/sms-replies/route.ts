import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth-utils"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the 15 most recent offline SMS replies
    const replies = await prisma.leaderSmsReply.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15
    })

    return NextResponse.json(replies)
  } catch (error) {
    console.error("Failed to fetch SMS replies:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
