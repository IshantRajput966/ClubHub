import Database from 'better-sqlite3';
const db = new Database('./dev.db');

// Get all SYSTEM posts
const posts = db.prepare("SELECT id, author, substr(content,1,120) as content FROM Post WHERE author = 'SYSTEM' OR author LIKE '%SYSTEM%'").all();
console.log('Posts to delete:');
posts.forEach(p => console.log(`  ID: ${p.id} | "${p.content}"`));

// Delete them all
const result = db.prepare("DELETE FROM Post WHERE author = 'SYSTEM' OR author LIKE '%SYSTEM%'").run();
console.log(`\nDeleted ${result.changes} post(s).`);

db.close();
