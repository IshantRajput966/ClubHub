import Database from "better-sqlite3"

const db = new Database("./dev.db")

const clubs = db.prepare("SELECT name, domain FROM Club").all()

console.log("Clubs in database:")
clubs.forEach((club: any) => {
  console.log(`- ${club.name} (${club.domain})`)
})

const memberClubs = db.prepare(`
  SELECT c.name, c.domain
  FROM Club c
  JOIN ClubMember cm ON c.id = cm.clubId
  WHERE cm.username = 'lakshya_dev'
`).all()

console.log("\nClubs joined by lakshya_dev:")
memberClubs.forEach((club: any) => {
  console.log(`- ${club.name} (${club.domain})`)
})

db.close()