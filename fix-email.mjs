import Database from "better-sqlite3"
const db = new Database("./dev.db")

const updates = [
  { username: "lakshya",  email: "lakshya.kushwahaaiml2023@indoreinstitute.com" },
  { username: "riya",     email: "riya.mishraaiml2023@indoreinstitute.com" },
  { username: "monty",    email: "monty.kushwaha1@indoreinstitute.com" },
  { username: "kunal",    email: "kunal.patidaraiml2023@indoreinstitute.com" },
  { username: "ishant",   email: "ishant.rajputaiml2023@indoreinstitute.com" },
  { username: "kartik",   email: "kartik.kushwahaaiml2023@indoreinstitute.com" },
]

for (const { username, email } of updates) {
  try {
    const result = db.prepare("UPDATE Member SET email = ? WHERE username = ?").run(email, username)
    if (result.changes > 0) console.log(`✓ ${username} → ${email}`)
    else console.log(`✗ ${username} not found`)
  } catch (e) {
    // If unique constraint, clear the old one first
    try {
      db.prepare("UPDATE Member SET email = NULL WHERE email = ?").run(email)
      db.prepare("UPDATE Member SET email = ? WHERE username = ?").run(email, username)
      console.log(`✓ ${username} → ${email} (replaced)`)
    } catch (e2) {
      console.log(`✗ ${username}: ${e2.message}`)
    }
  }
}

// Show final state
const members = db.prepare("SELECT username, email FROM Member WHERE username IN ('lakshya','riya','monty','kunal','ishant','kartik')").all()
console.log("\nFinal state:")
members.forEach(m => console.log(`  ${m.username}: ${m.email}`))

db.close()