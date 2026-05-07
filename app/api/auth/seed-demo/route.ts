import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * POST /api/auth/seed-demo
 * Creates demo accounts, clubs, and memberships for testing on deployed sites
 * Add header: X-Seed-Key=your-secret-key to authorize
 */
export async function POST(request: Request) {
  try {
    // Simple auth check - require a seed key in the header
    const seedKey = request.headers.get("X-Seed-Key")
    const validKey = process.env.SEED_KEY || "dev-seed-key-unsafe"

    if (seedKey !== validKey) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing X-Seed-Key header" },
        { status: 401 }
      )
    }

    const results = {
      membersCreated: [] as string[],
      clubsCreated: [] as string[],
      membershipLinked: [] as string[],
      announcementsCreated: [] as string[],
    }

    // 1. Create demo accounts
    const demoAccounts = [
      {
        username: "student_demo",
        email: "student@clubhub.demo",
        role: "student",
        bio: "A curious student exploring clubs on campus.",
        password: "DemoPass123!",
      },
      {
        username: "member_demo",
        email: "member@clubhub.demo",
        role: "member",
        bio: "Active club member participating in Tech Innovators.",
        password: "DemoPass123!",
      },
      {
        username: "leader_demo",
        email: "leader@clubhub.demo",
        role: "leader",
        bio: "President of Tech Innovators club.",
        password: "DemoPass123!",
      },
      {
        username: "faculty_demo",
        email: "faculty@clubhub.demo",
        role: "faculty",
        bio: "Faculty advisor overseeing student clubs.",
        password: "DemoPass123!",
      },
    ]

    for (const account of demoAccounts) {
      await prisma.member.upsert({
        where: { username: account.username },
        update: { bio: account.bio },
        create: account,
      })
      results.membersCreated.push(account.username)
    }

    // 2. Create sample clubs
    const clubs = [
      {
        name: "Tech Innovators",
        description: "A club for technology enthusiasts and innovators exploring the latest in software development, AI, and emerging technologies.",
        domain: "tech",
        createdBy: "student_demo",
      },
      {
        name: "Sports Warriors",
        description: "Join us for competitive sports, fitness training, and team-building activities across various sports disciplines.",
        domain: "sports",
        createdBy: "student_demo",
      },
      {
        name: "Art & Design Studio",
        description: "Express your creativity through painting, digital art, photography, and design projects in a supportive community.",
        domain: "arts",
        createdBy: "student_demo",
      },
      {
        name: "Science Explorers",
        description: "Dive deep into scientific research, experiments, and discussions on physics, chemistry, biology, and environmental science.",
        domain: "science",
        createdBy: "student_demo",
      },
    ]

    for (const club of clubs) {
      await prisma.club.upsert({
        where: { name: club.name },
        update: {},
        create: club,
      })
      results.clubsCreated.push(club.name)
    }

    // 3. Link demo accounts to Tech Innovators club
    const techClub = await prisma.club.findFirst({ where: { name: "Tech Innovators" } })

    if (techClub) {
      // leader_demo as president
      await prisma.clubMember.upsert({
        where: { clubId_username: { clubId: techClub.id, username: "leader_demo" } },
        update: { role: "president" },
        create: { clubId: techClub.id, username: "leader_demo", role: "president" },
      })
      results.membershipLinked.push("leader_demo → Tech Innovators (president)")

      // member_demo as member
      await prisma.clubMember.upsert({
        where: { clubId_username: { clubId: techClub.id, username: "member_demo" } },
        update: { role: "member" },
        create: { clubId: techClub.id, username: "member_demo", role: "member" },
      })
      results.membershipLinked.push("member_demo → Tech Innovators (member)")

      // student_demo as member
      await prisma.clubMember.upsert({
        where: { clubId_username: { clubId: techClub.id, username: "student_demo" } },
        update: { role: "member" },
        create: { clubId: techClub.id, username: "student_demo", role: "member" },
      })
      results.membershipLinked.push("student_demo → Tech Innovators (member)")
    }

    // 4. Create sample announcements
    const announcements = [
      {
        title: "Welcome to ClubHub!",
        content: "We're excited to launch ClubHub, your one-stop platform for discovering and joining student clubs.",
        author: "student_demo",
        clubName: "Tech Innovators",
      },
      {
        title: "Tech Innovators First Meeting",
        content: "Join us for our first meeting of the semester! We'll discuss upcoming projects and welcome new members.",
        author: "leader_demo",
        clubName: "Tech Innovators",
      },
    ]

    for (const announcement of announcements) {
      const club = await prisma.club.findFirst({ where: { name: announcement.clubName } })
      
      // Check if announcement already exists for this club
      const existing = await prisma.announcement.findFirst({
        where: { title: announcement.title, clubId: club?.id },
      })

      if (!existing) {
        await prisma.announcement.create({
          data: {
            title: announcement.title,
            content: announcement.content,
            author: announcement.author,
            clubId: club?.id,
            clubName: announcement.clubName,
          },
        })
        results.announcementsCreated.push(announcement.title)
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Demo data seeded successfully",
        ...results,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed demo data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
