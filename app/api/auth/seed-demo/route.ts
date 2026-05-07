import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const DEMO_PASSWORD = "DemoPass123!"

function hashPassword(password: string) {
  return createHash("sha256").update(password + "clubhub_salt_iist").digest("hex")
}

/**
 * POST /api/auth/seed-demo
 * Creates demo accounts, clubs, and memberships for testing on deployed sites.
 * Add header: X-Seed-Key=your-secret-key to authorize.
 */
export async function POST(request: Request) {
  try {
    const seedKey = request.headers.get("X-Seed-Key")
    const validKey = process.env.SEED_KEY || "dev-seed-key-unsafe"

    if (seedKey !== validKey) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing X-Seed-Key header" },
        { status: 401 },
      )
    }

    const results = {
      membersCreated: [] as string[],
      clubsCreated: [] as string[],
      membershipLinked: [] as string[],
      announcementsCreated: [] as string[],
      demoPassword: DEMO_PASSWORD,
    }

    const passwordHash = hashPassword(DEMO_PASSWORD)

    const demoAccounts = [
      {
        username: "student_demo",
        email: "student@clubhub.demo",
        role: "student",
        bio: "A curious student exploring clubs on campus.",
      },
      {
        username: "member_demo",
        email: "member@clubhub.demo",
        role: "member",
        bio: "Active club member participating in Tech Innovators.",
      },
      {
        username: "leader_demo",
        email: "leader@clubhub.demo",
        role: "leader",
        bio: "President of Tech Innovators club.",
      },
      {
        username: "faculty_demo",
        email: "faculty@clubhub.demo",
        role: "faculty",
        bio: "Faculty advisor overseeing student clubs.",
      },
    ]

    for (const account of demoAccounts) {
      await prisma.member.upsert({
        where: { username: account.username },
        update: {
          email: account.email,
          role: account.role,
          bio: account.bio,
          password: passwordHash,
        },
        create: {
          ...account,
          password: passwordHash,
        },
      })
      results.membersCreated.push(account.username)
    }

    const clubs = [
      {
        name: "Tech Innovators",
        description:
          "A club for technology enthusiasts and innovators exploring the latest in software development, AI, and emerging technologies.",
        domain: "tech",
        createdBy: "student_demo",
      },
      {
        name: "Sports Warriors",
        description:
          "Join us for competitive sports, fitness training, and team-building activities across various sports disciplines.",
        domain: "sports",
        createdBy: "student_demo",
      },
      {
        name: "Art & Design Studio",
        description:
          "Express your creativity through painting, digital art, photography, and design projects in a supportive community.",
        domain: "arts",
        createdBy: "student_demo",
      },
      {
        name: "Science Explorers",
        description:
          "Dive deep into scientific research, experiments, and discussions on physics, chemistry, biology, and environmental science.",
        domain: "science",
        createdBy: "student_demo",
      },
    ]

    for (const club of clubs) {
      await prisma.club.upsert({
        where: { name: club.name },
        update: {
          description: club.description,
          domain: club.domain,
          createdBy: club.createdBy,
        },
        create: club,
      })
      results.clubsCreated.push(club.name)
    }

    const techClub = await prisma.club.findFirst({ where: { name: "Tech Innovators" } })

    if (techClub) {
      await prisma.clubMember.upsert({
        where: { clubId_username: { clubId: techClub.id, username: "leader_demo" } },
        update: { role: "president" },
        create: { clubId: techClub.id, username: "leader_demo", role: "president" },
      })
      results.membershipLinked.push("leader_demo -> Tech Innovators (president)")

      await prisma.clubMember.upsert({
        where: { clubId_username: { clubId: techClub.id, username: "member_demo" } },
        update: { role: "member" },
        create: { clubId: techClub.id, username: "member_demo", role: "member" },
      })
      results.membershipLinked.push("member_demo -> Tech Innovators (member)")

      await prisma.clubMember.upsert({
        where: { clubId_username: { clubId: techClub.id, username: "student_demo" } },
        update: { role: "member" },
        create: { clubId: techClub.id, username: "student_demo", role: "member" },
      })
      results.membershipLinked.push("student_demo -> Tech Innovators (member)")
    }

    const announcements = [
      {
        title: "Welcome to ClubHub!",
        content:
          "We're excited to launch ClubHub, your one-stop platform for discovering and joining student clubs.",
        author: "student_demo",
        clubName: "Tech Innovators",
      },
      {
        title: "Tech Innovators First Meeting",
        content:
          "Join us for our first meeting of the semester! We'll discuss upcoming projects and welcome new members.",
        author: "leader_demo",
        clubName: "Tech Innovators",
      },
    ]

    for (const announcement of announcements) {
      const club = await prisma.club.findFirst({ where: { name: announcement.clubName } })
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
      { status: 201 },
    )
  } catch (error) {
    console.error("Seed error:", error)

    const details = error instanceof Error ? error.message : String(error)
    const hint =
      details.includes("relation") || details.includes("does not exist")
        ? "Database schema seems missing. Run prisma migrate deploy or prisma db push on your production database."
        : undefined

    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed demo data",
        details,
        ...(hint ? { hint } : {}),
      },
      { status: 500 },
    )
  }
}
