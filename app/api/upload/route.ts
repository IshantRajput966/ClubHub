// app/api/upload/route.ts
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file     = formData.get("file") as File
    const folder   = formData.get("folder") as string || "uploads"

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/<folder>/
    const dir = join(process.cwd(), "public", folder)
    await mkdir(dir, { recursive: true })

    const ext      = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filepath = join(dir, filename)

    await writeFile(filepath, buffer)

    return NextResponse.json({ url: `/${folder}/${filename}` })
  } catch (error) {
    console.error("Upload failed:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
