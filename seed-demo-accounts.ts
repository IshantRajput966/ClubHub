// Add this to your seed.ts file to create demo accounts in the DB
// Run: npx tsx seed.ts after adding this

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function seedDemoAccounts() {
  const accounts = [
    {
      username: "student_demo",
      email: "student@clubhub.demo",
      role: "student",
      bio: "A curious student exploring clubs on campus.",
      avatar: null,
    },
    {
      username: "member_demo",
      email: "member@clubhub.demo",
      role: "member",
      bio: "Active club member participating in Tech Innovators.",
      avatar: null,
    },
    {
      username: "leader_demo",
      email: "leader@clubhub.demo",
      role: "leader",
      bio: "President of Tech Innovators club.",
      avatar: null,
    },
    {
      username: "faculty_demo",
      email: "faculty@clubhub.demo",
      role: "faculty",
      bio: "Faculty advisor overseeing student clubs.",
      avatar: null,
    },
  ]

  for (const account of accounts) {
    await prisma.member.upsert({
      where: { username: account.username },
      update: {},
      create: account,
    })
    console.log(`✅ Created demo account: ${account.username}`)
  }

  // Make leader_demo the president of Tech Innovators (first club)
  const techClub = await prisma.club.findFirst({
    where: { name: "Tech Innovators" },
  })

  if (techClub) {
    await prisma.clubMember.upsert({
      where: { clubId_username: { clubId: techClub.id, username: "leader_demo" } },
      update: { role: "president" },
      create: { clubId: techClub.id, username: "leader_demo", role: "president" },
    })

    await prisma.clubMember.upsert({
      where: { clubId_username: { clubId: techClub.id, username: "member_demo" } },
      update: { role: "member" },
      create: { clubId: techClub.id, username: "member_demo", role: "member" },
    })
    console.log("✅ Linked demo accounts to Tech Innovators")
  }

  await prisma.$disconnect()
}

seedDemoAccounts().catch(console.error)
