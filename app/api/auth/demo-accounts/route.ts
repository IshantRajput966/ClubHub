import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// The authoritative list of usernames used for the Quick Login feature
const DEMO_USERNAMES = [
  "student_demo", "arjun_sharma", "priya_verma", "sneha_patel", "karan_singh", "rohan_gupta", "ishant", "kunal",
  "member_demo", "ananya_iyer", "vikram_nair", "divya_mishra", "rahul_joshi", "pooja_reddy", "riya", "monty",
  "leader_demo", "aditya_kumar", "meera_pillai", "nikhil_rao", "shreya_bose", "tanvir_khan", "lakshya", "kartik",
  "faculty_demo", "dr_sharma", "prof_mehta", "dr_krishnan", "prof_agarwal", "dr_banerjee",
  "aarav_sharma", "aditi_verma", "ishaan_gupta", "kavya_nair", "vihaan_malhotra", "ananya_singh", "reyansh_patel", "myra_iyer", "advait_joshi", "zara_rao"
]

export async function GET() {
  try {
    // 1. Fetch global account roles
    const members = await prisma.member.findMany({
      where: { username: { in: DEMO_USERNAMES } },
      select: { username: true, role: true }
    })

    // 2. Fetch all club memberships for these users to determine leadership
    const memberships = await prisma.clubMember.findMany({
      where: { username: { in: DEMO_USERNAMES } },
      select: { username: true, role: true }
    })

    // 3. Resolve "Effective Role"
    const resolvedUsers = members.map(m => {
      const userMemberships = memberships.filter(ms => ms.username === m.username)
      
      let effectiveRole = m.role // Default to global role (student/member/leader/faculty)

      // Promotion logic:
      if (m.role === "faculty") {
        effectiveRole = "faculty"
      } else if (userMemberships.some(ms => ["president", "officer", "leader"].includes(ms.role))) {
        effectiveRole = "leader"
      } else if (userMemberships.length > 0 || m.role === "member") {
        effectiveRole = "member"
      } else {
        effectiveRole = "student"
      }

      return {
        username: m.username,
        role: effectiveRole
      }
    })

    return NextResponse.json(resolvedUsers)
  } catch (error) {
    console.error("Demo Accounts API Error:", error)
    return NextResponse.json({ error: "Failed to fetch demo accounts" }, { status: 500 })
  }
}
