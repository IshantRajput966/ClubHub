import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

function hashPassword(password: string) {
  return createHash("sha256").update(password + "clubhub_salt_iist").digest("hex")
}

const ALL_DEMO_USERS = [
  "student_demo", "arjun_sharma", "priya_verma", "sneha_patel", "karan_singh", "rohan_gupta", "ishant", "kunal",
  "member_demo", "ananya_iyer", "vikram_nair", "divya_mishra", "rahul_joshi", "pooja_reddy", "riya", "monty",
  "leader_demo", "aditya_kumar", "meera_pillai", "nikhil_rao", "shreya_bose", "tanvir_khan", "lakshya", "kartik",
  "faculty_demo", "dr_sharma", "prof_mehta", "dr_krishnan", "prof_agarwal", "dr_banerjee",
  "aarav_sharma", "aditi_verma", "ishaan_gupta", "kavya_nair", "vihaan_malhotra", "ananya_singh", "reyansh_patel", "myra_iyer", "advait_joshi", "zara_rao"
]

export async function GET() {
  try {
    const targetHash = hashPassword("ClubHub@123")
    const report: any[] = []

    // 1. Audit all members
    const members = await prisma.member.findMany()
    
    for (const username of ALL_DEMO_USERS) {
      const user = members.find(m => m.username.trim().toLowerCase() === username.toLowerCase())
      
      if (!user) {
        report.push({ username, status: "NOT_FOUND_IN_DB" })
        continue
      }

      const currentPass = user.password
      const isCorrect = currentPass === targetHash

      if (!isCorrect) {
        await prisma.member.update({
          where: { id: user.id },
          data: { password: targetHash }
        })
        report.push({ 
          username: user.username, 
          status: "UPDATED", 
          wasCorrect: false,
          actualValueWas: currentPass ? (currentPass.length > 20 ? "DIFFERENT_HASH" : "PLAIN_TEXT") : "NULL" 
        })
      } else {
        report.push({ username: user.username, status: "ALREADY_CORRECT" })
      }
    }

    return NextResponse.json({ 
      success: true, 
      targetHashFound: report.filter(r => r.status === "ALREADY_CORRECT").length,
      updated: report.filter(r => r.status === "UPDATED").length,
      missing: report.filter(r => r.status === "NOT_FOUND_IN_DB").length,
      details: report
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
