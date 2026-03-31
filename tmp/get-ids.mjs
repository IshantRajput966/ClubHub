import Database from 'better-sqlite3';
const db = new Database('./dev.db', { readonly: true });
const posts = db.prepare("SELECT id, author FROM Post WHERE author='SYSTEM' OR author='System'").all();
posts.forEach(p => process.stdout.write(p.id + ' | ' + p.author + '\n'));
db.close();
