import Database from "better-sqlite3"

const db = new Database("./dev.db")

// Check current emails
const members = db.prepare("SELECT username, email FROM Member WHERE username IN ('leader_demo','member_demo','lakshya','student_demo')").all()
console.log("Current emails:", members)

// Update only the ones that don't already have your email
// Use + aliases so Gmail treats them as the same inbox
const updates = [
  { username: "leader_demo",  email: "kushwahalakshya1729+leader@gmail.com" },
  { username: "member_demo",  email: "kushwahalakshya1729+member@gmail.com" },
  { username: "lakshya",      email: "kushwahalakshya1729+lakshya@gmail.com" },
  { username: "student_demo", email: "kushwahalakshya1729+student@gmail.com" },
  { username: "arjun_sharma", email: "kushwahalakshya1729+arjun@gmail.com" },
  { username: "vikram_nair",  email: "kushwahalakshya1729+vikram@gmail.com" },
]

for (const { username, email } of updates) {
  try {
    db.prepare("UPDATE Member SET email = ? WHERE username = ?").run(email, username)
    console.log(`✓ ${username} → ${email}`)
  } catch (e) {
    console.log(`✗ ${username}: ${e.message}`)
  }
}

db.close()
console.log("\nDone! All emails updated.")
