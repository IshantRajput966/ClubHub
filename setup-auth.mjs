import Database from "better-sqlite3"
import { createHash } from "crypto"

const db = new Database("./dev.db")

// Simple password hashing using SHA256 (good enough for demo)
function hashPassword(password) {
  return createHash("sha256").update(password + "clubhub_salt_iist").digest("hex")
}

// Add password column if it doesn't exist
try {
  db.prepare("ALTER TABLE Member ADD COLUMN password TEXT").run()
  console.log("✓ Added password column")
} catch (e) {
  console.log("→ Password column already exists")
}

// Default password for all accounts: "ClubHub@123"
const defaultHash = hashPassword("ClubHub@123")

// Update all existing accounts with default password
db.prepare("UPDATE Member SET password = ? WHERE password IS NULL").run(defaultHash)
console.log("✓ Set default password for all accounts")

// Update emails for personal accounts
const emailUpdates = [
  { username: "riya",    email: "riya.mishraaiml2023@indoreinstitute.com" },
  { username: "monty",   email: "monty.kushwaha1@indoreinstitute.com" },
  { username: "kunal",   email: "kunal.patidaraiml2023@indoreinstitute.com" },
  { username: "ishant",  email: "ishant.rajputaiml2023@indoreinstitute.com" },
  { username: "kartik",  email: "kartik.kushwahaaiml2023@indoreinstitute.com" },
  { username: "lakshya", email: "lakshya.kushwahaaiml2023@indoreinstitute.com" },
]

for (const { username, email } of emailUpdates) {
  try {
    db.prepare("UPDATE Member SET email = ? WHERE username = ?").run(email, username)
    console.log(`✓ ${username} → ${email}`)
  } catch (e) {
    console.log(`✗ ${username}: ${e.message}`)
  }
}

// Show all accounts
const members = db.prepare("SELECT username, email, role, password IS NOT NULL as hasPassword FROM Member ORDER BY role, username").all()
console.log("\n── All Accounts ──────────────────────────────")
members.forEach(m => {
  console.log(`${m.role.padEnd(8)} | ${m.username.padEnd(20)} | ${m.email ?? "no email"} | pwd: ${m.hasPassword ? "✓" : "✗"}`)
})

db.close()
console.log("\n✅ Done! All accounts have password: ClubHub@123")
