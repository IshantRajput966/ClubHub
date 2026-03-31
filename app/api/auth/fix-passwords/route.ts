import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

function hashPassword(password: string) {
  return createHash("sha256").update(password + "clubhub_salt_iist").digest("hex")
}

const DEMO_USERNAMES = [
  "student_demo", "arjun_sharma", "priya_verma", "sneha_patel", "karan_singh", "rohan_gupta", "ishant", "kunal",
  "member_demo", "ananya_iyer", "vikram_nair", "divya_mishra", "rahul_joshi", "pooja_reddy", "riya", "monty",
  "leader_demo", "aditya_kumar", "meera_pillai", "nikhil_rao", "shreya_bose", "tanvir_khan", "lakshya", "kartik",
  "faculty_demo", "dr_sharma", "prof_mehta", "dr_krishnan", "prof_agarwal", "dr_banerjee",
  "aarav_sharma", "aditi_verma", "ishaan_gupta", "kavya_nair", "vihaan_malhotra", "ananya_singh", "reyansh_patel", "myra_iyer", "advait_joshi", "zara_rao"
]

export async function GET() {
  try {
    const correctHash = hashPassword("ClubHub@123")
    const updated = []

    for (const username of DEMO_USERNAMES) {
      const user = await prisma.member.findUnique({ where: { username } })
      if (user && user.password !== correctHash) {
        await prisma.member.update({
          where: { username },
          data: { password: correctHash }
        })
        updated.push(username)
      }
    }

    return NextResponse.json({ success: true, updatedCount: updated.length, usernames: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
