import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.member.findUnique({
    where: { username: "student_demo" }
  })
  console.log("Database Role for student_demo:", user?.role)
  await prisma.$disconnect()
}

main()
