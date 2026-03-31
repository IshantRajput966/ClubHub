import Database from 'better-sqlite3';
// Use the prisma-managed db inside prisma/dev.db
const db = new Database('./dev.db', { readonly: true });
const posts = db.prepare("SELECT id, author, substr(content,1,200) as content FROM Post WHERE author = 'SYSTEM' OR author LIKE '%SYSTEM%'").all();
console.log(JSON.stringify(posts, null, 2));
db.close();
