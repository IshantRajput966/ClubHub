import Database from "better-sqlite3"

const db = new Database("./dev.db")

const members = db.prepare("SELECT COUNT(*) as count FROM Member").get()
const clubs   = db.prepare("SELECT COUNT(*) as count FROM Club").get()
const posts   = db.prepare("SELECT COUNT(*) as count FROM Post").get()

console.log("Members:", members.count)
console.log("Clubs:",   clubs.count)
console.log("Posts:",   posts.count)

// Update emails
db.prepare("UPDATE Member SET email = ? WHERE username = ?").run("kushwahalakshya1729@gmail.com", "leader_demo")
db.prepare("UPDATE Member SET email = ? WHERE username = ?").run("kushwahalakshya1729@gmail.com", "member_demo")
db.prepare("UPDATE Member SET email = ? WHERE username = ?").run("kushwahalakshya1729@gmail.com", "lakshya")

console.log("Emails updated!")
db.close()