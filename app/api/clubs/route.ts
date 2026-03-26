import { NextResponse } from "next/server"
import Database from "better-sqlite3"

export async function GET() {
  try {
    const db = new Database("./dev.db")

    const clubs = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.domain,
        c.logoUrl,
        c.bannerUrl,
        c.createdBy,
        json_group_array(
          json_object('username', cm.username, 'role', cm.role)
        ) as members,
        json_group_array(
          json_object('id', e.id, 'title', e.title)
        ) as events
      FROM Club c
      LEFT JOIN ClubMember cm ON c.id = cm.clubId
      LEFT JOIN ClubEvent ce ON c.id = ce.clubId
      LEFT JOIN Event e ON ce.eventId = e.id
      GROUP BY c.id
      ORDER BY c.createdAt DESC
    `).all()

    // Parse the members and events JSON
    const parsedClubs = clubs.map((club: any) => ({
      ...club,
      members: JSON.parse(club.members).filter((m: any) => m.username !== null),
      events: JSON.parse(club.events).filter((e: any) => e.id !== null)
    }))

    db.close()
    return NextResponse.json(parsedClubs)
  } catch (error) {
    console.error("GET /api/clubs failed:", error)
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, domain, logoUrl, bannerUrl, createdBy } = await request.json()

    if (!name || !description || !domain || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const club = await prisma.club.create({
      data: {
        name,
        description,
        domain,
        logoUrl,
        bannerUrl,
        createdBy,
        members: {
          create: {
            username: createdBy,
            role: "president",
          },
        },
      },
      include: {
        members: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    })

    return NextResponse.json(club, { status: 201 })
  } catch (error) {
    console.error("POST /api/clubs failed:", error)
    return NextResponse.json(
      { error: "Failed to create club" },
      { status: 500 }
    )
  }
}
