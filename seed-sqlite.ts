import Database from "better-sqlite3"

const db = new Database("./dev.db")

// Insert sample clubs
const clubs = [
  {
    name: "Tech Innovators",
    description: "A club for technology enthusiasts and innovators exploring the latest in software development, AI, and emerging technologies.",
    domain: "tech",
    createdBy: "lakshya_dev",
  },
  {
    name: "Sports Warriors",
    description: "Join us for competitive sports, fitness training, and team-building activities across various sports disciplines.",
    domain: "sports",
    createdBy: "lakshya_dev",
  },
  {
    name: "Art & Design Studio",
    description: "Express your creativity through painting, digital art, photography, and design projects in a supportive community.",
    domain: "arts",
    createdBy: "lakshya_dev",
  },
  {
    name: "Science Explorers",
    description: "Dive deep into scientific research, experiments, and discussions on physics, chemistry, biology, and environmental science.",
    domain: "science",
    createdBy: "lakshya_dev",
  },
  {
    name: "Cultural Fusion",
    description: "Celebrate diversity through cultural events, traditional performances, international cuisine, and cross-cultural exchanges.",
    domain: "cultural",
    createdBy: "lakshya_dev",
  },
  {
    name: "Music & Performance",
    description: "Showcase your musical talents, learn instruments, and participate in concerts, musicals, and performance arts.",
    domain: "arts",
    createdBy: "lakshya_dev",
  },
]

const insertClub = db.prepare(`
  INSERT INTO Club (id, name, description, domain, createdBy, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const insertMember = db.prepare(`
  INSERT OR IGNORE INTO Member (id, username, email, role, joinDate, isActive)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const insertClubMember = db.prepare(`
  INSERT INTO ClubMember (id, clubId, username, role, joinedAt)
  VALUES (?, ?, ?, ?, ?)
`)

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Insert member
insertMember.run(
  generateId(),
  "lakshya_dev",
  "lakshya@example.com",
  "member",
  new Date().toISOString(),
  1
)

console.log("Created member: lakshya_dev")

// Insert clubs
for (const club of clubs) {
  const clubId = generateId()
  const now = new Date().toISOString()

  insertClub.run(
    clubId,
    club.name,
    club.description,
    club.domain,
    club.createdBy,
    now,
    now
  )

  console.log(`Created club: ${club.name}`)

  // Add member to first two clubs
  if (club.name === "Tech Innovators" || club.name === "Art & Design Studio") {
    insertClubMember.run(
      generateId(),
      clubId,
      "lakshya_dev",
      "member",
      now
    )
    console.log(`Added lakshya_dev to ${club.name}`)
  }
}

db.close()
console.log("Database seeded successfully!")