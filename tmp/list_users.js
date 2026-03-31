const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.member.findMany({
    select: { username: true, role: true, password: true }
  })
  console.log("Database Users:")
  users.forEach(u => {
    const passIndicator = u.password ? (u.password.length > 20 ? "[HASHED]" : "[PLAIN]") : "[NULL]"
    console.log(`- ${u.username} (${u.role}): ${passIndicator}`)
  })
  await prisma.$disconnect()
}

main().catch(console.error)
