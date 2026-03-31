import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        joinDate: "asc",
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("GET /api/members failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { username, email, role, bio, avatar } = await request.json()

    if (!username || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const member = await prisma.member.create({
      data: {
        username,
        email,
        role: role || "member",
        bio,
        avatar,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("POST /api/members failed:", error)
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}
