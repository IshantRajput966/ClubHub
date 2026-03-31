const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const DEMO_USERNAMES = [
  "student_demo", "arjun_sharma", "priya_verma", "sneha_patel", "karan_singh", "rohan_gupta", "ishant", "kunal",
  "member_demo", "ananya_iyer", "vikram_nair", "divya_mishra", "rahul_joshi", "pooja_reddy", "riya", "monty",
  "leader_demo", "aditya_kumar", "meera_pillai", "nikhil_rao", "shreya_bose", "tanvir_khan", "lakshya", "kartik",
  "faculty_demo", "dr_sharma", "prof_mehta", "dr_krishnan", "prof_agarwal", "dr_banerjee"
]

async function audit() {
  const users = await prisma.member.findMany({
    where: { username: { in: DEMO_USERNAMES } }
  })
  
  console.log("Current DB Status for Demo Accounts:")
  users.forEach(u => {
    console.log(`- ${u.username}: ${u.role}`)
  })
  
  await prisma.$disconnect()
}

audit().catch(console.error)
