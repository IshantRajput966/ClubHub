import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"
import { signToken } from "@/lib/auth-utils"

function hashPassword(password: string) {
  return createHash("sha256").update(password + "clubhub_salt_iist").digest("hex")
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const member = await prisma.member.findUnique({
      where: { username: username.trim().toLowerCase() }
    })

    if (!member) {
      console.log(`Login Failed: User "${username}" not found in DB`)
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const hash = hashPassword(password)
    console.log(`Login Attempt for ${username}:`)
    console.log(`- Input Pass: ${hash.substring(0, 10)}...`)
    console.log(`- DB Pass:    ${member.password ? member.password.substring(0, 10) : "NULL"}...`)

    if (!member.password || member.password !== hash) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }

    const token = await signToken({ username: member.username, role: member.role })

    const response = NextResponse.json({
      success:  true,
      username: member.username,
      role:     member.role,
      email:    member.email,
    })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
