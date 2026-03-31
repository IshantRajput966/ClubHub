import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

function hashPassword(password: string) {
  return createHash("sha256").update(password + "clubhub_salt_iist").digest("hex")
}

const NEW_STUDENTS = [
  "aarav_sharma", "aditi_verma", "ishaan_gupta", "kavya_nair", "vihaan_malhotra",
  "ananya_singh", "reyansh_patel", "myra_iyer", "advait_joshi", "zara_rao"
]

export async function GET() {
  try {
    const correctHash = hashPassword("ClubHub@123")
    const audit = []

    for (const username of NEW_STUDENTS) {
      const user = await prisma.member.findUnique({ where: { username } })
      if (!user) {
        audit.push({ username, status: "MISSING" })
        continue
      }

      const isCorrect = user.password === correctHash
      if (!isCorrect) {
        await prisma.member.update({
          where: { username },
          data: { password: correctHash }
        })
        audit.push({ username, status: "FIXED", oldPass: user.password ? "WRONG_HASH" : "NULL" })
      } else {
        audit.push({ username, status: "OK" })
      }
    }

    return NextResponse.json({ success: true, audit })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
