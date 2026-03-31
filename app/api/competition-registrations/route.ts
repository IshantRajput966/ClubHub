// app/api/competition-registrations/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId   = searchParams.get("clubId")
    const compId   = searchParams.get("competitionId")

    let rows: any[]
    if (clubId) {
      rows = await prisma.competitionRegistration.findMany({
        where: { clubId },
        orderBy: { createdAt: 'desc' }
      })
    } else if (compId) {
      rows = await prisma.competitionRegistration.findMany({
        where: { competitionId: compId },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      rows = await prisma.competitionRegistration.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET competition-registrations failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { competitionId, competitionName, clubId, clubName, name, email, phone, teamName } =
      await request.json()

    if (!name || !email || !competitionId) {
      return NextResponse.json({ error: "name, email, competitionId required" }, { status: 400 })
    }

    // Prevent duplicate registration
    const existing = await prisma.competitionRegistration.findFirst({
      where: { competitionId, email }
    })

    if (existing) {
      return NextResponse.json({ error: "Already registered with this email" }, { status: 409 })
    }

    // Save registration
    await prisma.competitionRegistration.create({
      data: {
        competitionId,
        competitionName,
        clubId: clubId ?? null,
        clubName: clubName ?? null,
        name,
        email,
        phone: phone ?? null,
        teamName: teamName ?? null,
      }
    })

    // Notify all leaders/officers of the club
    if (clubId) {
      const leaders = await prisma.clubMember.findMany({
        where: {
          clubId,
          role: { in: ['president', 'officer'] }
        },
        select: { username: true }
      })

      const teamInfo = teamName ? ` (Team: ${teamName})` : ""
      const notificationBody = `${name}${teamInfo} registered for ${competitionName}. Email: ${email}${phone ? `, Phone: ${phone}` : ""}`

      // Create notifications
      const notificationsData = leaders.map(leader => ({
        forUsername: leader.username,
        type: 'competition_registration',
        title: `New Registration: ${competitionName}`,
        body: notificationBody,
      }))

      if (notificationsData.length > 0) {
        await prisma.leaderNotification.createMany({
          data: notificationsData
        })
      }
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST competition-registrations failed:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
