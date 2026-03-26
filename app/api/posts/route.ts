import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 50,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.author || !body.content) {
      return NextResponse.json(
        { error: "Author and content are required" },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        author: body.author.trim(),
        content: body.content.trim(),
        imageUrl: body.imageUrl || null,
        videoUrl: body.videoUrl || null,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post. Database may not be set up yet. Try refreshing the page." },
      { status: 500 }
    )
  }
}