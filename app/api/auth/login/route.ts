// app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import Database from "better-sqlite3"
import { createHash } from "crypto"

function hashPassword(password: string) {
  return createHash("sha256").update(password + "clubhub_salt_iist").digest("hex")
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const db     = new Database("./dev.db")
    const member = db.prepare(
      "SELECT username, email, role, password FROM Member WHERE username = ?"
    ).get(username.trim().toLowerCase()) as any
    db.close()

    if (!member) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    const hash = hashPassword(password)
    if (member.password !== hash) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    return NextResponse.json({
      success:  true,
      username: member.username,
      role:     member.role,
      email:    member.email,
    })
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
