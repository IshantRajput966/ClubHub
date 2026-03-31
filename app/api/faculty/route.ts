import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const faculty = await prisma.member.findMany({
      where: { role: "faculty" },
      select: { username: true, email: true },
      orderBy: { username: "asc" }
    })
    return NextResponse.json(faculty)
  } catch (error) {
    console.error("GET /api/faculty failed:", error)
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 })
  }
}
