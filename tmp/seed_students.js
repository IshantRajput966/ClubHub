const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const students = [
  { username: "aarav_sharma",   email: "aarav.sharma@iist.edu.in",   bio: "B.Tech Computer Science | Tech Enthusiast" },
  { username: "aditi_verma",    email: "aditi.verma@iist.edu.in",    bio: "Electronics Engineering | Music Lover" },
  { username: "ishaan_gupta",   email: "ishaan.gupta@iist.edu.in",   bio: "Mechanical Engineering | Sports Fan" },
  { username: "kavya_nair",     email: "kavya.nair@iist.edu.in",     bio: "Civil Engineering | Aspiring Architect" },
  { username: "vihaan_malhotra",email: "vihaan.malhotra@iist.edu.in",bio: "IT Engineering | Full Stack Developer" },
  { username: "ananya_singh",   email: "ananya.singh@iist.edu.in",   bio: "Chemical Engineering | Sustainability Advocate" },
  { username: "reyansh_patel",  email: "reyansh.patel@iist.edu.in",  bio: "Mechanical Engineering | Robotic hobbyist" },
  { username: "myra_iyer",      email: "myra.iyer.edu.in",        bio: "Bio-Tech Student | Nature Enthusiast" },
  { username: "advait_joshi",   email: "advait.joshi@iist.edu.in",   bio: "B.Tech Student | Competitive Programmer" },
  { username: "zara_rao",       email: "zara.rao@iist.edu.in",       bio: "ECE Student | Content Creator" },
]

async function seed() {
  console.log("Seeding 10 Indian students...")
  for (const s of students) {
    try {
      await prisma.member.create({
        data: {
          username: s.username,
          email: s.email,
          bio: s.bio,
          role: "student",
          password: "ClubHub@123", // Standard demo password
          isActive: true
        }
      })
      console.log(`- Added ${s.username}`)
    } catch (e) {
      console.log(`- Skipping ${s.username} (already exists or error)`)
    }
  }
  await prisma.$disconnect()
  console.log("Seeding complete!")
}

seed().catch(console.error)
