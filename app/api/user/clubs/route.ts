import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const urlUsername = searchParams.get("username")
    
    // Hardcoded fallback logic from original code, but prioritizes URL param if passed
    const username = urlUsername || "lakshya_dev"

    const clubs = await prisma.club.findMany({
      where: {
        members: {
          some: { username }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        domain: true,
        logoUrl: true,
        bannerUrl: true,
      }
    })

    return NextResponse.json(clubs)
  } catch (error) {
    console.error("GET /api/user/clubs failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch user clubs" },
      { status: 500 }
    )
  }
}