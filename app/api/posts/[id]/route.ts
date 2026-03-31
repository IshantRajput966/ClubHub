import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+ params is a Promise — await it
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Check if the post exists first
    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    await prisma.post.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
