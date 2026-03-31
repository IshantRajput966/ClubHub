import Database from "better-sqlite3"
const db = new Database("./dev.db")

// Put YOUR email here — you'll receive announcement emails as a "member"
db.prepare("UPDATE Member SET email = ? WHERE username = ?")
  .run("kushwahalakshya450@gmail.com", "member_demo")

// Also set for other club members so demo looks realistic  
db.prepare("UPDATE Member SET email = ? WHERE username = ?")
  .run("kushwahalakshya450@gmail.com", "arjun_sharma")
db.prepare("UPDATE Member SET email = ? WHERE username = ?")
  .run("kushwahalakshya450@gmail.com", "vikram_nair")

console.log("Done!")
db.close()